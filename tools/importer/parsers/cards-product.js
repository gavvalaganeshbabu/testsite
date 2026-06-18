/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-product
 * Base block: cards
 * Source: https://www.kotak.bank.in/en/home.html (Kotak Mahindra Bank home page product showcase grid)
 * Generated: 2026-06-18
 * Verified against live DOM: 2 columncontrol instances, 3 cards each (6 total),
 * all images/eyebrows/headings/descriptions/CTAs resolved correctly.
 *
 * The instance element is a `div.columncontrol.section` containing a grid of product
 * feature cards. Each card (`div.featureCardRandomLogic` / `div.hp-main-box`) holds a
 * feature image, an ALL-CAPS eyebrow category, a heading, a short description, and an
 * "Apply Now" CTA link.
 *
 * Output (base "cards" conventions — library example was unavailable, fell back to
 * cards block structure + source HTML):
 *   Row 0: block name ("cards-product")
 *   Row N: [ image cell, text cell ] per card
 *     - text cell: eyebrow (as <strong>), heading, description, CTA
 *
 * Variations handled:
 *   - Cards may contain multiple `div.hp-main-box` children where only the first is
 *     visible and others have class "hidden" — only the visible (non-hidden) box is parsed.
 *   - Optional image / eyebrow / heading / description / CTA — each added only when present.
 *   - Empty `a.link-card` overlay anchor is excluded; only the labelled `a.em-cta` CTA is used.
 *   - Feature images are lazy-loaded responsive images with no `src` attribute — the real
 *     URL lives in `srcset` / `data-srcset`. We resolve a usable `src` from those so the
 *     importer downloads the correct asset.
 */

export default function parse(element, { document }) {
  /**
   * Resolve a usable image element with a concrete `src` for the importer.
   * Source images are lazy-loaded and may only carry `srcset` / `data-srcset`.
   * Defined inside parse() so it is always in scope when the parser runs.
   */
  const resolveImage = (img) => {
    if (!img) return null;
    // Prefer the lazy-load source attributes FIRST. The site's lazyload script empties
    // `src`/`srcset` on below-the-fold images in a live (headless) load, but the real URL
    // persists in data-srcset / data-originalsrc / data-src in the static markup.
    const fromSet = (val) => (val ? val.split(',')[0].trim().split(/\s+/)[0] : '');
    let src = img.getAttribute('data-originalsrc')
      || img.getAttribute('data-src')
      || img.getAttribute('data-original')
      || fromSet(img.getAttribute('data-srcset'))
      || img.getAttribute('src')
      || fromSet(img.getAttribute('srcset'));
    if (!src) return null;
    // Strip AEM ".transform/.../image.ext" rendition suffix to the clean base asset URL,
    // which the importer can reliably download (rendition paths get dropped).
    src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, '');
    // Absolutize against the source origin so the importer treats it as an external asset.
    try { src = new URL(src, 'https://www.kotak.bank.in').href; } catch (e) { /* keep as-is */ }
    const out = document.createElement('img');
    out.setAttribute('src', src);
    const alt = img.getAttribute('alt');
    if (alt) out.setAttribute('alt', alt);
    return out;
  };

  // Each card wrapper. Validated against source.html: cards live in
  // div.featureCardRandomLogic blocks inside the columncontrol grid.
  const cardWrappers = Array.from(
    element.querySelectorAll('.featureCardRandomLogic'),
  );

  const cells = [];

  cardWrappers.forEach((wrapper) => {
    // Only parse the visible card box; skip any hidden alternates.
    // hp-main-box class string may include extra tokens (e.g. "hp-main-box 1 em").
    const box = Array.from(wrapper.querySelectorAll('.hp-main-box')).find(
      (b) => !b.classList.contains('hidden'),
    );
    if (!box) return;

    // Image cell — the feature image (exclude the empty overlay link).
    // Lazy-loaded: real URL may live in srcset/data-srcset, so resolve a usable src.
    const rawImage = box.querySelector('img.em-img, img.img-responsive, img');
    const image = resolveImage(rawImage);

    // Text content.
    const eyebrow = box.querySelector('p.info-title, .em-sub-title');
    const heading = box.querySelector('h4.em-title, .em-title, h2, h3, h4, h5');
    const description = box.querySelector('p.em-desc, p.info-box, .em-desc');
    // The labelled CTA (has visible text). Exclude the empty overlay a.link-card.
    const cta = box.querySelector('a.em-cta, .link-box a, a.em-link:not(.link-card)');

    const textCell = [];
    if (eyebrow && eyebrow.textContent.trim()) {
      const strong = document.createElement('strong');
      strong.textContent = eyebrow.textContent.trim();
      textCell.push(strong);
    }
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    if (cta && cta.textContent.trim()) textCell.push(cta);

    // Skip cards that have no meaningful content.
    if (!image && textCell.length === 0) return;

    cells.push([image || '', textCell]);
  });

  // Empty-block guard: if no cards were extracted, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-product',
    cells,
  });
  element.replaceWith(block);
}
