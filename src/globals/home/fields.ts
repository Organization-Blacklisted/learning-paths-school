import type { ArrayField, Field } from "payload";

// Small helpers so the section modules read as a list of what an editor can change. What is NOT here on purpose: positions, widths, colours,
// timings, order and the number of rows of the designed lists. Those are design and stay in code (src/data/home-*.ts), see
// docs/26-cms-home-plan.md. Limits (`max`) are generous multiples of the current text: they only stop a text that would break the layout.

const ROW_LABEL = { RowLabel: "@/components/admin/RowLabel#RowLabel" };

/** A one-line text. */
export const line = (name: string, label: string, max: number, description?: string): Field => ({
  name,
  label,
  type: "text",
  required: true,
  maxLength: max,
  admin: { description },
});

/** A paragraph. */
export const paragraph = (name: string, label: string, max: number, description?: string): Field => ({
  name,
  label,
  type: "textarea",
  required: true,
  maxLength: max,
  admin: { description },
});

/** A photo from the media library. Its alt text is the one written in the library. */
export const photo = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: "upload",
  relationTo: "media",
  required: true,
  admin: {
    description:
      description ??
      "Choose a photo or upload one (JPG, PNG or WebP are converted to AVIF automatically). Its alt text comes from the library.",
  },
});

/** The three texts almost every section starts with: the green pill and the two-colour heading. */
export const heading = (lead = "Heading, grey part", accent = "Heading, blue part"): Field[] => [
  line("badge", "Green pill above the heading", 70),
  line("titleLead", lead, 80),
  line("titleAccent", accent, 50, "Shown in blue, slanted."),
];

type ListOptions = {
  name: string;
  label: string;
  fields: Field[];
  description?: string;
  /** Rows. The same number for min and max makes a FIXED list: the layout is designed for exactly that many. */
  min: number;
  max: number;
};

/** A list of rows. Rows are titled in the admin (see RowLabel); with min equal to max the editor can change the rows, not add or remove. */
export const list = ({ name, label, fields, description, min, max }: ListOptions): ArrayField => ({
  name,
  label,
  type: "array",
  minRows: min,
  maxRows: max,
  fields,
  admin: {
    description:
      min === max
        ? `${description ?? ""} The design has exactly ${min} here: change what is in each row, rows cannot be added or removed.`.trim()
        : description,
    isSortable: min !== max,
    components: { RowLabel: ROW_LABEL.RowLabel },
  },
});
