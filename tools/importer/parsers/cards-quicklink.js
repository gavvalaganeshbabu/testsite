/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quicklink.
 * Base block: cards
 * Source: https://www.kotak.bank.in/en/home.html (Kotak Mahindra Bank home page UPI/app/quick-link tile grid)
 * Generated: 2026-06-18.
 *
 * Structure: each tile (div.featurecards / div.hp-main-box) maps to one cards row with two cells:
 *   - image cell: the tile image
 *   - text cell: optional eyebrow (rendered as <strong>), heading, description, and "Know more" CTA link
 * Tiles without an eyebrow are handled gracefully (eyebrow omitted).
 *
 * Note: library-example.md / library-description.txt were unavailable; structure follows base
 * "cards" block conventions (image cell + text cell per row) validated against source.html.
 */
export default function parse(element, { document }) {
  /**
   * Resolve a usable image element with a concrete `src` for the importer.
   * Source images are lazy-loaded and/or carry AEM ".transform/.../image.ext"
   * rendition URLs that the importer drops; normalize to the clean base asset URL.
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
    src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, '');
    // Absolutize against the source origin so the importer treats it as an external asset.
    try { src = new URL(src, 'https://www.kotak.bank.in').href; } catch (e) { /* keep as-is */ }
    const out = document.createElement('img');
    out.setAttribute('src', src);
    const alt = img.getAttribute('alt');
    if (alt) out.setAttribute('alt', alt);
    return out;
  };

  // Each quick-link tile. Use the inner tile container so we capture one card per row.
  // Fallback selectors handle DOM variation across pages/instances.
  let tiles = Array.from(element.querySelectorAll('.featurecards .hp-main-box, .featurecards'));
  // Deduplicate: if .hp-main-box matched, drop the outer .featurecards wrappers that contain them.
  tiles = tiles.filter((tile) => !tiles.some((other) => other !== tile && tile.contains(other)));

  const cells = [];

  tiles.forEach((tile) => {
    // Image: the card image (exclude the invisible overlay link icons, which are <a>, not <img>).
    const image = resolveImage(tile.querySelector('img.em-img, img.img-responsive, img'));

    // Optional eyebrow / sub-title (may be absent on some tiles).
    const eyebrow = tile.querySelector('p.info-title, .em-sub-title');

    // Heading.
    const heading = tile.querySelector('h4.em-title, .em-title, h2, h3, h4');

    // Description.
    const description = tile.querySelector('.info-box.em-desc, .em-desc, .info-box');

    // "Know more"-style CTA. Prefer the visible CTA link over the full-card overlay link.
    // The overlay anchor (a.link-card.em-link) appears first in the DOM but has empty text,
    // so look for the visible CTA explicitly before falling back to the overlay link.
    let cta = tile.querySelector('a.em-cta, .link-box a');
    if (!cta) cta = tile.querySelector('a.em-link, a.link-card');
    // If we fell back to the overlay link (empty text), give it sensible label text.
    if (cta && !cta.textContent.trim()) {
      const label = cta.getAttribute('data-title') || 'Know more';
      cta.textContent = label;
    }

    // Skip tiles with no meaningful content.
    if (!heading && !description && !image) return;

    const textCell = [];
    if (eyebrow) {
      const strong = document.createElement('strong');
      strong.textContent = eyebrow.textContent.trim();
      textCell.push(strong);
    }
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    if (cta) textCell.push(cta);

    cells.push([image || '', textCell]);
  });

  // Empty-block guard: if no tiles produced content, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklink', cells });
  element.replaceWith(block);
}
