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
