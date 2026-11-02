import { globalReader } from "@/lib/api/cached-global";

// Reads the home page from the CMS (Payload global "home"), for the server: cached with the tag "home", published version only, never throws,
// null when the CMS cannot be read (then the page shows the default content in src/data, see mapHome). Publishing the global (or changing a photo)
// clears the tag (src/globals/Home.ts, src/collections/Media.ts, POST /api/revalidate). See src/lib/api/cached-global.ts. Pair of
// src/lib/api/home-map.ts (the pure mapper).
export const getHome = globalReader("home", "home");
