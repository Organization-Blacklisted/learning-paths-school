import { globalReader } from "@/lib/api/cached-global";

// Reads the Partnerships page from the CMS (Payload global "partnerships"), for the server: cached with the tag "partnerships", published version
// only, never throws, null when the CMS cannot be read (then the page shows src/data/partnerships.ts). See src/lib/api/cached-global.ts. Pair of
// src/lib/api/partnerships-map.ts (the pure mapper).
export const getPartnerships = globalReader("partnerships", "partnerships");
