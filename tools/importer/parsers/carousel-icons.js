/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-icons.
 * Base block: carousel
 * Source URL: https://www.kotak.bank.in/en/home.html
 * Generated: 2026-06-18
 *
 * Source is the "Need Help?" owl-carousel icon slider. Each slide is an
 * anchor (.iconsider-large-a) wrapping an icon image (.iconsider-large-img img),
 * a title (.iconsider-title) and a description (p.iconsider-dec).
 *
 * Each slide maps to a carousel row of two cells:
 *   - cell 1: the icon image
 *   - cell 2: title (as heading) + description, wrapped in the slide link
 *     so the whole item stays clickable.
 */
export default function parse(element, { document }) {
  // Optional slider heading (often empty in source).
  const headingEl = element.querySelector('h2.icon-slider-smallmain, .icon-maindiv > h2, [class*="icon-slider-smallmain"]');

  // Each carousel item. Prefer the owl item anchors; fall back to any slide anchor.
  let items = Array.from(element.querySelectorAll('.owl-item > a.iconsider-large-a'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('a.iconsider-large-a, a.iconslider-event-lgtab'));
  }

  const cells = [];

  items.forEach((item) => {
    const href = item.getAttribute('href');

    // Icon image cell.
    const img = item.querySelector('.iconsider-large-img img, img');

    // Title and description.
    const titleEl = item.querySelector('.iconsider-title, [class*="iconsider-title"]');
    const descEl = item.querySelector('p.iconsider-dec, .iconsider-dec, p');

    // Build the text content; promote the title to a heading.
    const textContent = [];
    if (titleEl) {
      const heading = document.createElement('h3');
      heading.textContent = titleEl.textContent.trim();
      textContent.push(heading);
    }
    if (descEl) {
      textContent.push(descEl);
    }

    // Wrap the text in the slide link so the whole item stays clickable.
    let textCell;
    if (href) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      textContent.forEach((node) => link.appendChild(node));
      textCell = link;
    } else {
      textCell = textContent;
    }

    // Skip empty slides.
    if (!img && (!titleEl && !descEl)) return;

    cells.push([img || '', textCell]);
  });

  // Empty-block guard: nothing meaningful extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Prepend the optional heading as a full-width row if it has content.
  if (headingEl && headingEl.textContent.trim()) {
    cells.unshift([headingEl]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-icons', cells });
  element.replaceWith(block);
}
