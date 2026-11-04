import { globalReader } from "@/lib/api/cached-global";

// Reads the Student Council page from the CMS (Payload global "student-council"), for the server: cached with the tag "student-council", published
// version only, never throws, null when the CMS cannot be read (then the page shows src/data/student-council.ts). See src/lib/api/cached-global.ts.
// Pair of src/lib/api/student-council-map.ts (the pure mapper).
export const getStudentCouncil = globalReader("student-council", "student-council");
