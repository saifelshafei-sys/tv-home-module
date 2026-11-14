# TV Home (TizenBrew module)

A clean home screen for a Samsung TV: your mountain-lake picture with a frosted-glass clock behind
the peak, and one glass row of twelve apps (Netflix, Apple TV, Yango Play, Prime Video, Disney+,
YouTube, Shahid, OSN+, Starzplay, Anghami, Apple Music, Spotify). There are no ads and no phone remote. You use the normal TV remote.

## Put it on the TV

1. **Install TizenBrew on the TV** by following its guide (Developer Mode on the TV, then
   TizenBrew Installer on a computer): https://github.com/reisxd/TizenBrew
2. **Publish this folder as a public GitHub repo**, for example `yourname/tv-home-module`.
   `package.json` must sit at the top of the repo.
3. **Add it in TizenBrew:** open TizenBrew on the TV, go to Add Module, choose GitHub and enter
   `yourname/tv-home-module`.
4. **Make it open by itself:** in TizenBrew's settings, set this module as the autolaunch module.
   Opening TizenBrew then opens the home screen straight away.

TizenBrew loads modules through jsDelivr, which can cache a branch for up to 12 hours. After you
change something, tag a new version (for example `git tag v1.0.1 && git push --tags`) and add the
module as `yourname/tv-home-module@v1.0.1` to see the change at once.

## Remote

- LEFT / RIGHT: move between apps
- OK: open the app
- INFO (or BLUE): show the app ids. UP / DOWN pages through the list. INFO or BACK closes it.

## If a tile does not open

A small yellow dot under a name means the home screen has no id for that app yet. Yango Play,
Shahid, OSN+, Starzplay, Anghami and Apple Music start that way because their Samsung ids aren't
published.

- If the TV lets TizenBrew read its app list, the dot goes away and the tile finds the app by name.
- If it doesn't, press INFO. The top line says whether the TV shared its list. Then find the app's
  id another way (for example the SmartThings app or a Home Assistant Samsung integration) and add it
  to that app's `ids` in `app/apps.js`.

## App logos

Each tile shows the app's logo if there is a picture for it in `app/logos/` (square PNG, about
512 x 512, named as in `app/apps.js`, for example `netflix.png`). Without one, the tile shows the
app's name. No logos are included: they belong to each company, so add the ones you want yourself.
couch-tv's repo has logos for Netflix, YouTube, Prime Video, Disney+, Apple TV and Spotify in
`remote/src/app-logos/` (named by Android package, so rename them).

## Change the apps

Edit `app/apps.js`. The order of the list is the order on screen. For a 24-hour clock, set
`CLOCK_24H = true` at the top of `app/main.js`.

## Preview on a computer

Open `app/index.html` in Chrome at 1920 x 1080. Add `?info=1` to open the app id list, or
`?hour=22` to see the dimmer late-night look (after 9 pm).

## Credits

- The scene (`app/scene/`) is your own picture, resized to 1920 x 1080. `scene-fg.webp` is the
  mountains and trees cut out of it (the sky made transparent), drawn over the clock;
  `scene-glass.jpg` is a blurred, brightened copy used as the clock's frosted glass. The glass clock
  and cut-out idea come from couch-tv: https://github.com/seagey/couch-tv
- The clock font is Antonio (SIL Open Font License), as bundled in couch-tv.
