import type { PageBlock } from "@/types/page";

/**
 * Keeps only the first `limit` sections of a page, in page order, and drops the rest (they are not rendered at all, so none of their images,
 * scripts or animations load). `null` keeps everything. Used to launch with part of a page while the rest is still being built or reviewed.
 *
 * What counts as a section: every block, and every PANEL of a sideways scene (so "the first 3" of hero + scene[vision, courage, journey]
 * is hero, vision, courage). A scene that loses some of its panels keeps the rest; a scene that loses all of them disappears.
 */
export function takeFirstSections(blocks: PageBlock[], limit: number | null): PageBlock[] {
  if (limit === null) return blocks;
  let left = Math.max(0, limit);
  const kept: PageBlock[] = [];
  for (const block of blocks) {
    if (left <= 0) break;
    if (block.blockType === "scene") {
      const panels = block.panels.slice(0, left);
      left -= panels.length;
      if (panels.length > 0) kept.push({ ...block, panels });
    } else {
      kept.push(block);
      left -= 1;
    }
  }
  return kept;
}

/**
 * Leaves out the sections of the given types (for example `["courage"]`), wherever they are: a plain block of that type, or a PANEL of a sideways
 * scene. A scene that loses some panels keeps the rest (one panel left is just an ordinary section); a scene that loses all of them disappears.
 * Nothing of a hidden section is rendered, so none of its images, scripts or animations load. Used to hide a section for now without deleting it.
 */
export function withoutSections(blocks: PageBlock[], hidden: readonly string[]): PageBlock[] {
  if (hidden.length === 0) return blocks;
  const kept: PageBlock[] = [];
  for (const block of blocks) {
    if (block.blockType === "scene") {
      const panels = block.panels.filter((panel) => !hidden.includes(panel.block.blockType));
      if (panels.length > 0) kept.push(panels.length === block.panels.length ? block : { ...block, panels });
    } else if (!hidden.includes(block.blockType)) {
      kept.push(block);
    }
  }
  return kept;
}
