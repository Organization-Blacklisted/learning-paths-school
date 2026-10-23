/** One alumnus or alumna of "Their Paths Continue Long After They Leave". */
export type AlumniPerson = {
  id: string;
  name: string;
  /** University or institution, shown under the name. */
  institution: string;
  /** Portrait (path under /public): the Figma photo cropped to its 428 x 385 slot at 2x, AVIF. */
  photo: { src: string; alt: string };
};

export type AlumniContent = {
  label: string;
  badge: string;
  /** Heading: "Their", the blue slanted "Paths Continue", then a second line "Long After They Leave". */
  titleStart: string;
  titleAccent: string;
  titleSecondLine: string;
  paragraphs: string[];
  people: AlumniPerson[];
};
