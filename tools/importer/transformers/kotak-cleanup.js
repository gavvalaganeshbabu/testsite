/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak Mahindra Bank site-wide cleanup.
 *
 * Source is a legacy AEM Classic (parsys/iparsys) page. All selectors below were
 * verified against migration-work/cleaned.html for the home page
 * (https://www.kotak.bank.in/en/home.html). None are guessed.
 *
 * beforeTransform — removes elements that would corrupt block parsing:
 *   - owl-carousel JS-cloned slide duplicates (.owl-item.cloned) which would
 *     otherwise emit duplicate content rows in carousel/cards parsers
 *   - owl-carousel nav/dots chrome (.owl-nav, .owl-dots)
 *   - injected <link>, <script>, <input type="hidden"> inside content blocks
 *   - modal / audio / popup overlays (.modal, .sf-popup-div, .search-modal-popup,
 *     <audio>) that sit inside content groups
 *
 * afterTransform — removes non-authorable page chrome and empty AEM placeholders:
 *   - maintenance notice bar (rc1: #notification_widget / .header-info-box / #modal-widget-*)
 *   - mobile sticky tab bar (rc3: .headerfooter-container)
 *   - empty AEM parsys/iparsys placeholders (div.new, div.iparys_inherited — rc5/6/7/8/10/11)
 *   - leftover non-authorable elements (link, script, noscript, iframe, source)
 *   - inline event-handler / tracking attributes
 *
 * Header (rc2) and footer (rc12) are intentionally NOT removed here — they map to
 * the auto-populated header/footer blocks in page-templates.json.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove the site header and footer from the page content. These are rendered
    // globally by the project's header/footer blocks (sourced from nav.plain.html /
    // footer.plain.html), so the source markup must NOT be imported as page content —
    // otherwise the full nav tree (logo + Personal/Business/NRI mega-menu links) renders
    // again inside the page. Found in cleaned.html: body > header.header-container,
    // body > footer.footer.
    WebImporter.DOMUtils.remove(element, [
      'header.header-container',
      'header.search-results-cont',
      '.mobile-header-container',
      'footer.footer',
    ]);

    // Normalize lazy-loaded images BEFORE parsing. The site's lazyload script empties
    // `src`/`srcset` on below-the-fold images during a live (headless) import, but the real
    // URL persists in data-srcset / data-originalsrc / data-src. Promote it to a concrete
    // `src` and strip AEM ".transform/.../image.ext" rendition suffix so the importer keeps
    // the asset. Runs page-wide so every block (cards, columns, carousels) gets real images.
    element.querySelectorAll('img').forEach((img) => {
      const hasRealSrc = img.getAttribute('src') && !img.getAttribute('src').startsWith('data:');
      if (hasRealSrc) return;
      const fromSet = (val) => (val ? val.split(',')[0].trim().split(/\s+/)[0] : '');
      let src = img.getAttribute('data-originalsrc')
        || img.getAttribute('data-src')
        || img.getAttribute('data-original')
        || fromSet(img.getAttribute('data-srcset'))
        || fromSet(img.getAttribute('srcset'));
      if (!src) return;
      src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, '');
      img.setAttribute('src', src);
    });

    // owl-carousel JS-generated duplicate slides + nav/dots chrome.
    // Found in cleaned.html: class="owl-item cloned", div.owl-nav, div.owl-dots
    WebImporter.DOMUtils.remove(element, [
      '.owl-item.cloned',
      '.owl-nav',
      '.owl-dots',
    ]);

    // Injected non-content elements embedded inside content blocks.
    // Found in cleaned.html: <link rel="stylesheet"> clientlibs, <script>, <input type="hidden">
    WebImporter.DOMUtils.remove(element, [
      'link',
      'script',
      'input[type="hidden"]',
    ]);

    // Modal / popup / audio overlays inside content groups.
    // Found in cleaned.html: .modal, .sf-popup-div, .search-modal-popup, <audio>
    WebImporter.DOMUtils.remove(element, [
      '.modal',
      '.sf-popup-div',
      '.search-modal-popup',
      'audio',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Page chrome with minimal authorable value.
    // rc1 maintenance notice bar — found in cleaned.html: #notification_widget,
    //   section.header-info-box, [id^="modal-widget-"]
    // rc3 mobile sticky tab bar — found in cleaned.html: .headerfooter-container
    WebImporter.DOMUtils.remove(element, [
      '#notification_widget',
      '.header-info-box',
      '[id^="modal-widget-"]',
      '.headerfooter-container',
    ]);

    // Empty AEM parsys/iparsys placeholder containers (rc5/rc6/rc7/rc8/rc10/rc11).
    // Found in cleaned.html: class="new", class="iparys_inherited".
    // Only remove when they carry no authorable content (text or media).
    element.querySelectorAll('div.new, div.iparys_inherited').forEach((el) => {
      const hasMedia = el.querySelector('img, picture, video, iframe, a, table');
      const hasText = el.textContent && el.textContent.trim().length > 0;
      if (!hasMedia && !hasText) {
        el.remove();
      }
    });

    // Leftover non-authorable / unsafe elements.
    WebImporter.DOMUtils.remove(element, [
      'link',
      'script',
      'noscript',
      'iframe',
      'source',
    ]);

    // Strip inline handlers / tracking attributes that survive into markdown.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('data-gtm');
      el.removeAttribute('data-track');
    });
  }
}
