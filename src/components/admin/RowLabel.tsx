"use client";

import { useRowLabel } from "@payloadcms/ui";

// The title of a row in the admin's lists ("02 · Our Mission" instead of "Item 02"), so an editor can tell the rows of a list apart.
// It shows the first text the row has under one of the usual names.
const NAMES = ["title", "label", "name", "level", "slot", "date", "text"];
// A long text (a paragraph of a letter) is cut after this many characters.
const MAX = 48;

export function RowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  const text = NAMES.map((name) => data?.[name]).find((value): value is string => typeof value === "string" && value.trim() !== "");
  const number = String((rowNumber ?? 0) + 1).padStart(2, "0");
  const short = text && text.length > MAX ? `${text.slice(0, MAX).trimEnd()}…` : text;
  return <span>{short ? `${number} · ${short}` : `Item ${number}`}</span>;
}
