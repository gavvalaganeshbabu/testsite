/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-promo.
 * Base block: carousel
 * Source: https://www.kotak.bank.in/en/home.html (thin promotional carousel / .thincarousalbanner)
 * Generated: 2026-06-18 (validated against live source)
 *
 * Variant notes: thin image-only promo banner strip. Each owl-carousel slide is a
 * linked <picture>/<img> (desktop <img> + mobile <source>) wrapped in an <a>, with NO text.
 * Cloned duplicate slides were already removed by the cleanup transformer.
 * Each slide maps to a carousel row containing a single IMAGE cell (the text cell is omitted).
 */
export default function parse(element, { document }) {
  // owl-carousel injects duplicate ".cloned" .owl-item nodes for its infinite-loop effect.
  // Whether or not owl initialized, collect every slide then drop any inside a cloned item.
  // (The cleanup transformer also removes clones, but the parser must be self-sufficient
  // when run against the raw live DOM.)
  let slides = Array.from(element.querySelectorAll('.owlcarousal-slide'))
    .filter((slide) => !slide.closest('.owl-item.cloned'));

  if (slides.length === 0) {
    // Fallback: anchors wrapping a picture/image (excluding clones).
    slides = Array.from(element.querySelectorAll('a:has(picture), a:has(img)'))
      .filter((node) => !node.closest('.owl-item.cloned'));
  }
  if (slides.length === 0) {
    // Last resort: standalone pictures (excluding clones).
    slides = Array.from(element.querySelectorAll('picture'))
      .filter((node) => !node.closest('.owl-item.cloned'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // The linked image: keep the anchor wrapping the picture/img so the slide link is preserved.
    const link = slide.matches('a') ? slide : slide.querySelector('a');
    const picture = slide.querySelector('picture');
    const img = slide.querySelector('img');

    // Prefer the full linked picture (retains href + responsive sources). Fall back gracefully.
    const imageContent = (link && (link.querySelector('picture') || link.querySelector('img')))
      ? link
      : (picture || img);

    if (imageContent) {
      // Image-only slide: single image cell, no text cell.
      cells.push([imageContent]);
    }
  });

  // Empty-block guard: no slides found -> unwrap rather than emit an empty carousel.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-promo', cells });
  element.replaceWith(block);
}
