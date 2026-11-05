import { globalReader } from "@/lib/api/cached-global";

// Reads the Welcome to LPS page from the CMS (Payload global "welcome-to-lps"), for the server: cached with the tag "welcome-to-lps", published version only,
// never throws, null when the CMS cannot be read (then the page shows src/data/welcome-to-lps.ts). See src/lib/api/cached-global.ts.
// Pair of src/lib/api/welcome-to-lps-map.ts (the pure mapper).
export const getWelcomeToLps = globalReader("welcome-to-lps", "welcome-to-lps");
