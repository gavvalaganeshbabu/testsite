/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-hero
 * Base block: carousel
 * Source URL: https://www.kotak.bank.in/en/home.html
 * Generated: 2026-06-18
 *
 * Variant: full-bleed dark hero banner carousel with overlay text.
 * Source is an owl-carousel (.heroslider). Owl injects cloned duplicate slides
 * (.owl-item.cloned, and at runtime simple repeats for looping). The cleanup
 * transformer removes clones in the import pipeline, but the parser validation hook
 * runs against the raw live page where clones are still present — so this parser
 * also de-duplicates defensively (skip .cloned owl items + dedupe by content key).
 *
 * Each slide contains:
 *   - a background <picture>/<img class="hs-image"> (desktop + mobile sources)
 *   - an <h1> or <h2> title (.hero-banner-title)
 *   - a description paragraph (.hero-banner-desc)
 *   - a single "Apply Now"-style CTA link (.btn-box a)
 *
 * Target carousel table layout (one row per slide):
 *   Row 0: block name
 *   Row N: [ image cell | text cell (heading + description + CTA) ]
 *
 * Validated: produces 4 unique slide rows (Credit Cards, Metal Debit Card,
 * FCNR deposits, NRE/NRO account); owl loop repeats are de-duplicated by content key.
 */
export default function parse(element, { document }) {
  // Collect every slide. .hero-carousel-item is the slide content wrapper.
  // Skip owl clones: a clone lives inside .owl-item.cloned.
  const slides = Array.from(element.querySelectorAll('.hero-carousel-item'))
    .filter((slide) => !slide.closest('.owl-item.cloned'));

  const cells = [];
  // Owl loops duplicate the first/last real slides at runtime; dedupe by content
  // so each unique banner appears exactly once.
  const seen = new Set();

  slides.forEach((slide) => {
    // Background image: the rendered <img> inside the slide's <picture>.
    // Prefer the dedicated hero image, with sensible fallbacks.
    const image = slide.querySelector('picture img.hs-image, picture img, img.hs-image, img');

    // Heading: h1 or h2 carrying the hero title.
    const heading = slide.querySelector('.hero-banner-title, h1, h2');

    // Description: the hero description block (contains a <p>).
    const description = slide.querySelector('.hero-banner-desc, .hero-banner-desc p');

    // CTA: the single "Apply Now"-style action link.
    const ctaLinks = Array.from(slide.querySelectorAll('.btn-box a, a.btn-primary, a.btn'));

    // Skip empty slides (no meaningful content).
    if (!image && !heading && !description && !ctaLinks.length) {
      return;
    }

    // Dedupe owl loop repeats by a content key (heading + first CTA href).
    const key = `${heading ? heading.textContent.trim() : ''}|${ctaLinks[0] ? ctaLinks[0].getAttribute('href') : ''}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    const imageCell = image ? [image] : [''];

    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    ctaLinks.forEach((link) => textCell.push(link));

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard: nothing extractable, unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
