import { globalReader } from "@/lib/api/cached-global";

// Reads the Signature Events page from the CMS (Payload global "signature-events"), for the server: cached with the tag "signature-events", published
// version only, never throws, null when the CMS cannot be read (then the page shows src/data/signature-events.ts). See src/lib/api/cached-global.ts.
// Pair of src/lib/api/signature-events-map.ts (the pure mapper).
export const getSignatureEvents = globalReader("signature-events", "signature-events");
