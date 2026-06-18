/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-story
 * Base block: cards
 * Source: https://www.kotak.bank.in/en/home.html (Knowledge Hub "Stories in focus")
 * Generated: 2026-06-18
 *
 * Maps the "Stories in focus" Knowledge Hub grid to a cards block. The source
 * has two parts inside the section:
 *   1. A featured story card (.featurecards / .guidance-box): thumbnail <img>
 *      (lazyload — real URL in data-src), eyebrow (p.info-title "Stories in
 *      focus"), title (h4.em-title), and a "Read more" link (a.em-cta).
 *   2. A "Stories in focus" link list (.multiplelinkblock / ul.mf-list):
 *      repeating <li.mf-list-item> each with a small <img> thumbnail and a
 *      titled <a> link.
 *
 * The featured card AND each list item are treated uniformly as story cards.
 * Each becomes one cards row: [image cell, text cell].
 *
 * NOTE: The block library example/description were unavailable at generation
 * time, so the output follows the base "cards" block convention validated
 * against blocks/cards/cards.js: a two-column table where each row is one card
 * with an image cell (single <img>) and a text/body cell.
 *
 * Lazyload handling: some thumbnails defer the real URL to data-src/data-lazy
 * and leave src empty. Those are normalized to a real src so the importer can
 * resolve and download the image; otherwise the image transform drops/aborts.
 */
export default function parse(element, { document }) {
  // Promote lazyload data-* URLs to src so WebImporter can resolve the image.
  const normalizeImg = (img) => {
    if (!img) return null;
    const real = img.getAttribute('data-src')
      || img.getAttribute('data-lazy-src')
      || img.getAttribute('data-original');
    if (real && !img.getAttribute('src')) {
      img.setAttribute('src', real);
    }
    // No usable source at all — skip the image rather than emit a broken cell.
    return img.getAttribute('src') ? img : null;
  };

  const rows = [];

  // --- Part 1: Featured story card -------------------------------------
  // Validated against source: .featurecards .guidance-box (with fallbacks).
  const featured = element.querySelector(
    '.guidance-box, .feature-card, .featurecards .hp-main-box, .featurecards',
  );
  if (featured) {
    const img = normalizeImg(featured.querySelector('img'));
    const eyebrow = featured.querySelector('.info-title, p.info-title');
    const title = featured.querySelector('.em-title, h2, h3, h4');
    const cta = featured.querySelector('a.em-cta, .link-box a, a.em-link');

    const textCell = [];
    if (eyebrow) textCell.push(eyebrow);
    if (title) textCell.push(title);
    if (cta) textCell.push(cta);

    if (img || textCell.length) {
      rows.push([img || '', textCell.length ? textCell : '']);
    }
  }

  // --- Part 2: "Stories in focus" link list ----------------------------
  // Validated against source: ul.mf-list > li.mf-list-item
  const listItems = Array.from(
    element.querySelectorAll('ul.mf-list > li, .mf-list > li, .multiplelinkblock li'),
  );
  listItems.forEach((li) => {
    const img = normalizeImg(li.querySelector('img'));
    const link = li.querySelector('.mf-list-item-text a, a');

    const textCell = [];
    if (link) textCell.push(link);

    if (img || textCell.length) {
      rows.push([img || '', textCell.length ? textCell : '']);
    }
  });

  // Empty-block guard: if no story cards were found, unwrap the element.
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [...rows];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-story', cells });
  element.replaceWith(block);
}
