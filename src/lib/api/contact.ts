import { globalReader } from "@/lib/api/cached-global";

// Reads the Contact page from the CMS (Payload global "contact"), for the server: cached with the tag "contact", published version only, never
// throws, null when the CMS cannot be read (then the page shows src/data/contact.ts). See src/lib/api/cached-global.ts. Pair of
// src/lib/api/contact-map.ts (the pure mapper).
export const getContact = globalReader("contact", "contact");
