import { globalReader } from "@/lib/api/cached-global";

// Reads the Awards & Recognition page from the CMS (Payload global "awards-recognition"), for the server: cached with the tag "awards-recognition",
// published version only, never throws, null when the CMS cannot be read (then the page shows src/data/awards-recognition.ts). See
// src/lib/api/cached-global.ts. Pair of src/lib/api/awards-recognition-map.ts (the pure mapper).
export const getAwardsRecognition = globalReader("awards-recognition", "awards-recognition");
