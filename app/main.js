/* The home screen. Plain ES5 so it runs on the 2018 Samsung browser. */
(function () {
  "use strict";

  var CLOCK_24H = false;           // true for 21:40, false for 9:40 PM

  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, INFO: 457, BLUE: 406 };
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December"];

  var apps = window.HOME_APPS || [];
  var tilesEl = document.getElementById("tiles");
  var focusNameEl = document.getElementById("focusName");
  var toastEl = document.getElementById("toast");
  var infoEl = document.getElementById("info");
  var tiles = [];
  var focus = 0;
  var installed = null;        // the TV's app list, if it lets us read it
  var installedError = "";
  var infoOpen = false, infoPage = 0, infoLines = [];

  function hasTizen() { return typeof tizen !== "undefined" && tizen && tizen.application; }
  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  // ---- the glass clock and the date ----
  var shownTime = "";
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var d = new Date();
    var forced = param("hour");
    var h = forced !== null ? parseInt(forced, 10) : d.getHours();
    var m = d.getMinutes();
    var t = CLOCK_24H ? pad(h) + ":" + pad(m) : ((h % 12) || 12) + ":" + pad(m);
    document.getElementById("date").textContent = DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
    document.body.className = h >= 21 || h < 5 ? "late" : "";
    if (t === shownTime) return;
    shownTime = t;
    var c = document.getElementById("clock");
    c.innerHTML = '<span class="fill">' + t + '</span><span class="sheen">' + t + '</span><span class="rim">' + t + "</span>";
    // line the blurred photo up with the screen, so the digits look like frosted glass over it
    var f = c.querySelector(".fill");
    f.style.backgroundPosition = -(c.offsetLeft + f.offsetLeft) + "px " + -(c.offsetTop + f.offsetTop) + "px";
  }
  function alignGlass() {
    var b = tilesEl, x = 0, y = 0, el = b;
    while (el) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    b.style.backgroundPosition = -x + "px " + -y + "px";
  }

  // ---- the TV's own app list (works only if the TV allows it from TizenBrew) ----
  function readInstalled(done) {
    if (!hasTizen()) { installedError = "Not running on the TV (preview)."; return done(); }
    try {
      tizen.application.getAppsInfo(function (list) {
        installed = list.map(function (a) { return { id: a.id, name: a.name || "" }; });
        done();
      }, function (e) { installedError = (e && (e.name + ": " + e.message)) || "refused"; done(); });
    } catch (e) { installedError = e.name ? e.name + ": " + e.message : String(e); done(); }
  }

  function candidates(app) {
    var ids = [];
    function add(id) { if (id && ids.indexOf(id) < 0) ids.push(id); }
    if (installed && app.match) {
      var found = installed.filter(function (a) { return app.match.test(a.name) || app.match.test(a.id); });
      found.filter(function (a) { return !/-dummy$/.test(a.id); }).forEach(function (a) { add(a.id); });
      found.filter(function (a) { return /-dummy$/.test(a.id); }).forEach(function (a) { add(a.id); });
    }
    (app.ids || []).forEach(add);
    return ids;
  }

  // ---- tiles ----
  function build() {
    apps.forEach(function (app, i) {
      var el = document.createElement("div");
      el.className = "tile";
      el.style.backgroundColor = app.color || "#333";
      el.innerHTML = '<div class="sheen"></div><b></b>';
      el.lastChild.textContent = app.name;
      el.setAttribute("data-base", "tile");
      tilesEl.appendChild(el);
      tiles.push(el);
      if (app.logo) showLogo(el, "logos/" + app.logo);
    });
    var saved = parseInt(load("home.focus"), 10);
    setFocus(isNaN(saved) ? 0 : Math.min(saved, apps.length - 1));
  }
  // the app's own logo, when a picture for it is in app/logos/; otherwise the tile keeps its name
  function showLogo(el, src) {
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = "url(" + src + ")";
      el.setAttribute("data-base", "tile logo");
      el.className = el.className.replace(/^tile\b/, "tile logo");
    };
    img.src = src;
  }
  function markMissing() {
    apps.forEach(function (app, i) {
      var none = candidates(app).length === 0;
      var base = tiles[i].getAttribute("data-base");
      tiles[i].className = base + (none ? " missing" : "") + (i === focus ? " focused" : "");
    });
  }
  function setFocus(i) {
    if (!tiles.length) return;
    focus = (i + tiles.length) % tiles.length;
    for (var k = 0; k < tiles.length; k++) {
      var c = tiles[k].className.replace(/\s*focused/g, "");
      tiles[k].className = k === focus ? c + " focused" : c;
    }
    focusNameEl.textContent = apps[focus].name;
    store("home.focus", String(focus));
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.className = "toast show";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = "toast"; }, 4500);
  }

  function open(app) {
    if (!hasTizen()) { toast("Preview only: on the TV this opens " + app.name + "."); return; }
    var ids = candidates(app);
    if (!ids.length) { toast(app.name + " has no app id yet. Press INFO to find it."); return; }
    (function attempt(i) {
      if (i >= ids.length) { toast("Couldn't open " + app.name + ". Is it installed? Press INFO for ids."); return; }
      try {
        tizen.application.launch(ids[i], function () {}, function () { attempt(i + 1); });
      } catch (e) { attempt(i + 1); }
    })(0);
  }

  // ---- INFO: list what the TV has, so a missing id can be copied into apps.js ----
  var PER_PAGE = 36;
  function renderInfo() {
    var status = document.getElementById("infoStatus");
    var list = document.getElementById("infoList");
    var lines = [];
    apps.forEach(function (app) {
      var c = candidates(app);
      lines.push("<b>" + esc(app.name) + "</b> <i>→ " + (c.length ? esc(c.join(", ")) : "no id") + "</i>");
    });
    if (installed) {
      status.textContent = "The TV shared " + installed.length + " apps. Your tiles first, then everything installed (UP/DOWN to page).";
      lines.push("&nbsp;");
      installed.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (a) {
        lines.push("<b>" + esc(a.name) + "</b> <i>" + esc(a.id) + "</i>");
      });
    } else {
      status.textContent = "The TV did not share its app list (" + installedError + "). Only your tiles' ids are shown.";
    }
    infoLines = lines;
    var pages = Math.max(1, Math.ceil(lines.length / PER_PAGE));
    infoPage = Math.max(0, Math.min(infoPage, pages - 1));
    list.innerHTML = "<div>" + lines.slice(infoPage * PER_PAGE, (infoPage + 1) * PER_PAGE).join("</div><div>") + "</div>";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function toggleInfo(show) {
    infoOpen = show;
    infoEl.className = show ? "info show" : "info";
    if (show) { infoPage = 0; renderInfo(); }
  }

  // ---- remote ----
  document.addEventListener("keydown", function (e) {
    var k = e.keyCode;
    if (infoOpen) {
      if (k === KEY.INFO || k === KEY.BLUE || k === KEY.BACK || k === KEY.ENTER) toggleInfo(false);
      else if (k === KEY.DOWN) { infoPage++; renderInfo(); }
      else if (k === KEY.UP) { infoPage--; renderInfo(); }
      e.preventDefault();
      return;
    }
    if (k === KEY.LEFT) setFocus(focus - 1);
    else if (k === KEY.RIGHT) setFocus(focus + 1);
    else if (k === KEY.ENTER) open(apps[focus]);
    else if (k === KEY.INFO || k === KEY.BLUE) toggleInfo(true);
    else if (k === KEY.BACK) { /* this is the home: Back stays here */ }
    else return;
    e.preventDefault();
  });

  // keys TizenBrew may not have registered for us
  if (typeof tizen !== "undefined" && tizen.tvinputdevice) {
    ["Info", "ColorF3Blue"].forEach(function (name) { try { tizen.tvinputdevice.registerKey(name); } catch (e) {} });
  }

  build();
  markMissing();
  alignGlass();
  tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { shownTime = ""; tick(); });
  setInterval(tick, 10000);
  readInstalled(markMissing);
  markMissing();
  if (param("info") === "1") toggleInfo(true);
})();
