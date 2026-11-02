import { globalReader } from "@/lib/api/cached-global";

// Reads the Principal's Welcome page from the CMS (Payload global "principals-welcome"), for the server: cached with the tag "principals-welcome",
// published version only, never throws, null when the CMS cannot be read (then the page shows src/data/principals-welcome.ts). See
// src/lib/api/cached-global.ts. Pair of src/lib/api/principals-welcome-map.ts (the pure mapper).
export const getPrincipalsWelcome = globalReader("principals-welcome", "principals-welcome");
