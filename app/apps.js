/*
 * The apps on the home screen, left to right. Edit this list to add, remove or reorder apps.
 *
 *   name   what the tile says
 *   match  a pattern for the app's name as the TV lists it (used when the TV lets us read its apps)
 *   ids    Samsung app ids to try, first to last
 *   color  the tile colour
 *   logo   a picture in app/logos/ to show instead of the name (square PNG, about 512 x 512).
 *          If the file is missing, the tile shows the name.
 *
 * Ids for Netflix, YouTube, Prime Video, Disney+, Apple TV and Spotify come from couch-tv (checked on a 2021
 * Samsung). Yango Play, Shahid, OSN+, Starzplay, Anghami and Apple Music have no known id yet: they open only if the TV lets us
 * read its app list. If one does not open, press INFO on the remote: it lists the ids on your TV,
 * and you paste the right one into "ids" below.
 */
var HOME_APPS = [
  { name: "Netflix", logo: "netflix.png", match: /netflix/i, color: "#b20710",
    ids: ["org.tizen.netflix-app", "3201907018807", "11101200001"] },
  { name: "Apple TV", logo: "apple-tv.png", match: /apple\s*tv/i, color: "#2b2b2e",
    ids: ["com.samsung.tv.aria-video", "3201807016597"] },
  { name: "Yango Play", logo: "yango-play.png", match: /yango/i, color: "#5b2be0",
    ids: [] },
  { name: "Prime Video", logo: "prime-video.png", match: /prime\s*video|amazon/i, color: "#0f79af",
    ids: ["org.tizen.primevideo", "3201910019365", "3201512006785"] },
  { name: "Disney+", logo: "disney-plus.png", match: /disney/i, color: "#0b2a7a",
    ids: ["MCmYXNxgcu.DisneyPlus", "3201901017640", "3202009021709", "3202204027038"] },
  { name: "YouTube", logo: "youtube.png", match: /^youtube$|tizenyoutube/i, color: "#c4120f",
    ids: ["9Ur5IzDKqV.TizenYouTube", "111299001912"] },
  { name: "Shahid", logo: "shahid.png", match: /shahid/i, color: "#0e6b4f",
    ids: [] },
  { name: "OSN+", logo: "osn-plus.png", match: /osn/i, color: "#2a2d36",
    ids: [] },
  { name: "Starzplay", logo: "starzplay.png", match: /starz/i, color: "#3d1f78",
    ids: [] },
  { name: "Anghami", logo: "anghami.png", match: /anghami/i, color: "#7a1fa2",
    ids: [] },
  { name: "Apple Music", logo: "apple-music.png", match: /apple\s*music/i, color: "#d2304a",
    ids: [] },
  { name: "Spotify", logo: "spotify.png", match: /spotify/i, color: "#15883e",
    ids: ["rJeHak5zRg.Spotify", "3201606009684"] }
];
