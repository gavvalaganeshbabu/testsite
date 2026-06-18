/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns-feature
 * Base block: columns
 * Source: https://www.kotak.bank.in/en/home.html
 *   (Kotak Mahindra Bank home page "Hausla hai toh ho jayega" campaign feature)
 * Generated: 2026-06-18
 * Verified against migration-work/block-context/columns-feature/source.html and
 * against the live DOM (selector match, two col-md columns, YouTube link, thumbnail,
 * heading and description all resolve; parser emits one row of two cells).
 *
 * The instance element is a `div.columncontrol.section` holding a single `div.row`
 * with two `col-md` cells:
 *   1. Left/larger cell (`col-md-8`): a video thumbnail — an <img> inside an anchor
 *      (`a.track-videos`) that links to a YouTube embed
 *      (href="https://www.youtube.com/embed/...").
 *   2. Right cell (`col-md-4`): a heading (`p.video-title-large` "Hausla hai toh ho
 *      jayega") and a descriptive paragraph (`div.comp-desc` / `div.text`). Its own
 *      image (`videoBlockImg-WithoutLink`) has no link and is decorative only.
 *
 * Output (base "columns" conventions — block library example was unavailable because
 * the library endpoint was unreachable; fell back to the base columns block structure
 * + source HTML). This is a one-off side-by-side campaign feature, NOT a repeating set:
 *   Row 0: block name ("columns-feature")
 *   Row 1: [ media cell, text cell ]  ← exactly one row, two columns
 *     - media cell: the video thumbnail image wrapped in its YouTube link
 *     - text cell:  heading + description paragraph
 *
 * Variations handled:
 *   - Thumbnail image is lazy-loaded; a usable `src` may live in srcset/data-* — resolved.
 *   - The video link is preserved by wrapping the thumbnail in an anchor pointing at the
 *     YouTube embed URL (so the columns block renders a linked media cell).
 *   - The empty heading inside the media cell is ignored; the real heading comes from the
 *     text (right) cell.
 *   - Heading / description / link each added only when present.
 */

export default function parse(element, { document }) {
  /**
   * Resolve a usable image element with a concrete `src` for the importer.
   * Source images are lazy-loaded and may only carry srcset / data-srcset.
   */
  const resolveImage = (img) => {
    if (!img) return null;
    // Prefer lazy-load data-* attributes FIRST (live lazyload empties src/srcset below the fold).
    const fromSet = (val) => (val ? val.split(',')[0].trim().split(/\s+/)[0] : '');
    let src = img.getAttribute('data-originalsrc')
      || img.getAttribute('data-src')
      || img.getAttribute('data-original')
      || fromSet(img.getAttribute('data-srcset'))
      || img.getAttribute('src')
      || fromSet(img.getAttribute('srcset'));
    if (!src) return null;
    // Strip AEM ".transform/.../image.ext" rendition suffix to the clean base asset URL.
    src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, '');
    // Absolutize against the source origin so the importer treats it as an external asset.
    try { src = new URL(src, 'https://www.kotak.bank.in').href; } catch (e) { /* keep as-is */ }
    const out = document.createElement('img');
    out.setAttribute('src', src);
    const alt = img.getAttribute('alt');
    if (alt) out.setAttribute('alt', alt);
    return out;
  };

  // The two side-by-side cells of the single feature row.
  // Validated against source.html: a `div.row` with `col-md-8` (media) + `col-md-4` (text).
  const row = element.querySelector('.row') || element;
  const cols = Array.from(row.querySelectorAll(':scope > [class*="col-md"], :scope > [class*="col-"]'));
  const mediaCol = cols[0] || element;
  const textCol = cols[1] || element;

  // ---- Media cell: video thumbnail preserving the YouTube link ----
  // Prefer the thumbnail that sits inside the video anchor (left cell). Fall back to any
  // image in the media column.
  const videoLink = mediaCol.querySelector('a.track-videos, a[href*="youtube"], a[href*="youtu.be"], a[href*="/embed/"]');
  const rawThumb = (videoLink && videoLink.querySelector('img'))
    || mediaCol.querySelector('img.em-img, img');
  const thumb = resolveImage(rawThumb);

  let mediaCell = '';
  if (thumb) {
    const href = videoLink && videoLink.getAttribute('href');
    if (href) {
      // Wrap the thumbnail in an anchor so the linked video is preserved.
      const anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      anchor.append(thumb);
      mediaCell = anchor;
    } else {
      mediaCell = thumb;
    }
  }

  // ---- Text cell: heading + description ----
  // Heading: the populated video-title-large in the text column (the media column's
  // title is empty). Match :scope-wide and skip empty headings.
  const headingCandidates = Array.from(
    textCol.querySelectorAll('p.video-title-large, .info-title, h2, h3, h4'),
  ).filter((el) => el.textContent.trim());
  const rawHeading = headingCandidates[0];

  // Prefer the inner description content node (`.comp-desc` / `.text`) over its
  // `.info-box` wrapper so the markdown stays clean; fall back to the wrapper.
  const description = textCol.querySelector('.comp-desc, .text')
    || textCol.querySelector('.info-box, p.em-desc');

  const textCell = [];
  if (rawHeading) {
    // Promote the campaign title to a real heading for clean markdown semantics.
    const h = document.createElement('h2');
    h.textContent = rawHeading.textContent.trim();
    textCell.push(h);
  }
  if (description && description.textContent.trim()) textCell.push(description);

  // Empty-block guard: if nothing meaningful was extracted, unwrap instead of emitting
  // an empty block.
  if (!mediaCell && textCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Exactly one row of two columns for this one-off feature.
  const cells = [[mediaCell, textCell]];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-feature',
    cells,
  });
  element.replaceWith(block);
}
