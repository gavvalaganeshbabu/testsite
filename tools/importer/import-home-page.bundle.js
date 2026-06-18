/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home-page.js
  var import_home_page_exports = {};
  __export(import_home_page_exports, {
    default: () => import_home_page_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".hero-carousel-item")).filter((slide) => !slide.closest(".owl-item.cloned"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      const image = slide.querySelector("picture img.hs-image, picture img, img.hs-image, img");
      const heading = slide.querySelector(".hero-banner-title, h1, h2");
      const description = slide.querySelector(".hero-banner-desc, .hero-banner-desc p");
      const ctaLinks = Array.from(slide.querySelectorAll(".btn-box a, a.btn-primary, a.btn"));
      if (!image && !heading && !description && !ctaLinks.length) {
        return;
      }
      const key = `${heading ? heading.textContent.trim() : ""}|${ctaLinks[0] ? ctaLinks[0].getAttribute("href") : ""}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const imageCell = image ? [image] : [""];
      const textCell = [];
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      ctaLinks.forEach((link) => textCell.push(link));
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-promo.js
  function parse2(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".owlcarousal-slide")).filter((slide) => !slide.closest(".owl-item.cloned"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll("a:has(picture), a:has(img)")).filter((node) => !node.closest(".owl-item.cloned"));
    }
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll("picture")).filter((node) => !node.closest(".owl-item.cloned"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const link = slide.matches("a") ? slide : slide.querySelector("a");
      const picture = slide.querySelector("picture");
      const img = slide.querySelector("img");
      const imageContent = link && (link.querySelector("picture") || link.querySelector("img")) ? link : picture || img;
      if (imageContent) {
        cells.push([imageContent]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-icons.js
  function parse3(element, { document }) {
    const headingEl = element.querySelector('h2.icon-slider-smallmain, .icon-maindiv > h2, [class*="icon-slider-smallmain"]');
    let items = Array.from(element.querySelectorAll(".owl-item > a.iconsider-large-a"));
    if (!items.length) {
      items = Array.from(element.querySelectorAll("a.iconsider-large-a, a.iconslider-event-lgtab"));
    }
    const cells = [];
    items.forEach((item) => {
      const href = item.getAttribute("href");
      const img = item.querySelector(".iconsider-large-img img, img");
      const titleEl = item.querySelector('.iconsider-title, [class*="iconsider-title"]');
      const descEl = item.querySelector("p.iconsider-dec, .iconsider-dec, p");
      const textContent = [];
      if (titleEl) {
        const heading = document.createElement("h3");
        heading.textContent = titleEl.textContent.trim();
        textContent.push(heading);
      }
      if (descEl) {
        textContent.push(descEl);
      }
      let textCell;
      if (href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        textContent.forEach((node) => link.appendChild(node));
        textCell = link;
      } else {
        textCell = textContent;
      }
      if (!img && (!titleEl && !descEl)) return;
      cells.push([img || "", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (headingEl && headingEl.textContent.trim()) {
      cells.unshift([headingEl]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-icons", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse4(element, { document }) {
    const resolveImage = (img) => {
      if (!img) return null;
      const fromSet = (val) => val ? val.split(",")[0].trim().split(/\s+/)[0] : "";
      let src = img.getAttribute("data-originalsrc") || img.getAttribute("data-src") || img.getAttribute("data-original") || fromSet(img.getAttribute("data-srcset")) || img.getAttribute("src") || fromSet(img.getAttribute("srcset"));
      if (!src) return null;
      src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, "");
      try {
        src = new URL(src, "https://www.kotak.bank.in").href;
      } catch (e) {
      }
      const out = document.createElement("img");
      out.setAttribute("src", src);
      const alt = img.getAttribute("alt");
      if (alt) out.setAttribute("alt", alt);
      return out;
    };
    const cardWrappers = Array.from(
      element.querySelectorAll(".featureCardRandomLogic")
    );
    const cells = [];
    cardWrappers.forEach((wrapper) => {
      const box = Array.from(wrapper.querySelectorAll(".hp-main-box")).find(
        (b) => !b.classList.contains("hidden")
      );
      if (!box) return;
      const rawImage = box.querySelector("img.em-img, img.img-responsive, img");
      const image = resolveImage(rawImage);
      const eyebrow = box.querySelector("p.info-title, .em-sub-title");
      const heading = box.querySelector("h4.em-title, .em-title, h2, h3, h4, h5");
      const description = box.querySelector("p.em-desc, p.info-box, .em-desc");
      const cta = box.querySelector("a.em-cta, .link-box a, a.em-link:not(.link-card)");
      const textCell = [];
      if (eyebrow && eyebrow.textContent.trim()) {
        const strong = document.createElement("strong");
        strong.textContent = eyebrow.textContent.trim();
        textCell.push(strong);
      }
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      if (cta && cta.textContent.trim()) textCell.push(cta);
      if (!image && textCell.length === 0) return;
      cells.push([image || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-product",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-story.js
  function parse5(element, { document }) {
    const normalizeImg = (img) => {
      if (!img) return null;
      const real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
      if (real && !img.getAttribute("src")) {
        img.setAttribute("src", real);
      }
      return img.getAttribute("src") ? img : null;
    };
    const rows = [];
    const featured = element.querySelector(
      ".guidance-box, .feature-card, .featurecards .hp-main-box, .featurecards"
    );
    if (featured) {
      const img = normalizeImg(featured.querySelector("img"));
      const eyebrow = featured.querySelector(".info-title, p.info-title");
      const title = featured.querySelector(".em-title, h2, h3, h4");
      const cta = featured.querySelector("a.em-cta, .link-box a, a.em-link");
      const textCell = [];
      if (eyebrow) textCell.push(eyebrow);
      if (title) textCell.push(title);
      if (cta) textCell.push(cta);
      if (img || textCell.length) {
        rows.push([img || "", textCell.length ? textCell : ""]);
      }
    }
    const listItems = Array.from(
      element.querySelectorAll("ul.mf-list > li, .mf-list > li, .multiplelinkblock li")
    );
    listItems.forEach((li) => {
      const img = normalizeImg(li.querySelector("img"));
      const link = li.querySelector(".mf-list-item-text a, a");
      const textCell = [];
      if (link) textCell.push(link);
      if (img || textCell.length) {
        rows.push([img || "", textCell.length ? textCell : ""]);
      }
    });
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [...rows];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-quicklink.js
  function parse6(element, { document }) {
    const resolveImage = (img) => {
      if (!img) return null;
      const fromSet = (val) => val ? val.split(",")[0].trim().split(/\s+/)[0] : "";
      let src = img.getAttribute("data-originalsrc") || img.getAttribute("data-src") || img.getAttribute("data-original") || fromSet(img.getAttribute("data-srcset")) || img.getAttribute("src") || fromSet(img.getAttribute("srcset"));
      if (!src) return null;
      src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, "");
      try {
        src = new URL(src, "https://www.kotak.bank.in").href;
      } catch (e) {
      }
      const out = document.createElement("img");
      out.setAttribute("src", src);
      const alt = img.getAttribute("alt");
      if (alt) out.setAttribute("alt", alt);
      return out;
    };
    let tiles = Array.from(element.querySelectorAll(".featurecards .hp-main-box, .featurecards"));
    tiles = tiles.filter((tile) => !tiles.some((other) => other !== tile && tile.contains(other)));
    const cells = [];
    tiles.forEach((tile) => {
      const image = resolveImage(tile.querySelector("img.em-img, img.img-responsive, img"));
      const eyebrow = tile.querySelector("p.info-title, .em-sub-title");
      const heading = tile.querySelector("h4.em-title, .em-title, h2, h3, h4");
      const description = tile.querySelector(".info-box.em-desc, .em-desc, .info-box");
      let cta = tile.querySelector("a.em-cta, .link-box a");
      if (!cta) cta = tile.querySelector("a.em-link, a.link-card");
      if (cta && !cta.textContent.trim()) {
        const label = cta.getAttribute("data-title") || "Know more";
        cta.textContent = label;
      }
      if (!heading && !description && !image) return;
      const textCell = [];
      if (eyebrow) {
        const strong = document.createElement("strong");
        strong.textContent = eyebrow.textContent.trim();
        textCell.push(strong);
      }
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      if (cta) textCell.push(cta);
      cells.push([image || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-quicklink", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse7(element, { document }) {
    const resolveImage = (img) => {
      if (!img) return null;
      const fromSet = (val) => val ? val.split(",")[0].trim().split(/\s+/)[0] : "";
      let src = img.getAttribute("data-originalsrc") || img.getAttribute("data-src") || img.getAttribute("data-original") || fromSet(img.getAttribute("data-srcset")) || img.getAttribute("src") || fromSet(img.getAttribute("srcset"));
      if (!src) return null;
      src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, "");
      try {
        src = new URL(src, "https://www.kotak.bank.in").href;
      } catch (e) {
      }
      const out = document.createElement("img");
      out.setAttribute("src", src);
      const alt = img.getAttribute("alt");
      if (alt) out.setAttribute("alt", alt);
      return out;
    };
    const row = element.querySelector(".row") || element;
    const cols = Array.from(row.querySelectorAll(':scope > [class*="col-md"], :scope > [class*="col-"]'));
    const mediaCol = cols[0] || element;
    const textCol = cols[1] || element;
    const videoLink = mediaCol.querySelector('a.track-videos, a[href*="youtube"], a[href*="youtu.be"], a[href*="/embed/"]');
    const rawThumb = videoLink && videoLink.querySelector("img") || mediaCol.querySelector("img.em-img, img");
    const thumb = resolveImage(rawThumb);
    let mediaCell = "";
    if (thumb) {
      const href = videoLink && videoLink.getAttribute("href");
      if (href) {
        const anchor = document.createElement("a");
        anchor.setAttribute("href", href);
        anchor.append(thumb);
        mediaCell = anchor;
      } else {
        mediaCell = thumb;
      }
    }
    const headingCandidates = Array.from(
      textCol.querySelectorAll("p.video-title-large, .info-title, h2, h3, h4")
    ).filter((el) => el.textContent.trim());
    const rawHeading = headingCandidates[0];
    const description = textCol.querySelector(".comp-desc, .text") || textCol.querySelector(".info-box, p.em-desc");
    const textCell = [];
    if (rawHeading) {
      const h = document.createElement("h2");
      h.textContent = rawHeading.textContent.trim();
      textCell.push(h);
    }
    if (description && description.textContent.trim()) textCell.push(description);
    if (!mediaCell && textCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[mediaCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns-feature",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kotak-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-container",
        "header.search-results-cont",
        ".mobile-header-container",
        "footer.footer"
      ]);
      element.querySelectorAll("img").forEach((img) => {
        const hasRealSrc = img.getAttribute("src") && !img.getAttribute("src").startsWith("data:");
        if (hasRealSrc) return;
        const fromSet = (val) => val ? val.split(",")[0].trim().split(/\s+/)[0] : "";
        let src = img.getAttribute("data-originalsrc") || img.getAttribute("data-src") || img.getAttribute("data-original") || fromSet(img.getAttribute("data-srcset")) || fromSet(img.getAttribute("srcset"));
        if (!src) return;
        src = src.replace(/\.transform\/[^/]+\/image\.[a-z0-9]+$/i, "");
        img.setAttribute("src", src);
      });
      WebImporter.DOMUtils.remove(element, [
        ".owl-item.cloned",
        ".owl-nav",
        ".owl-dots"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "link",
        "script",
        'input[type="hidden"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".modal",
        ".sf-popup-div",
        ".search-modal-popup",
        "audio"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#notification_widget",
        ".header-info-box",
        '[id^="modal-widget-"]',
        ".headerfooter-container"
      ]);
      element.querySelectorAll("div.new, div.iparys_inherited").forEach((el) => {
        const hasMedia = el.querySelector("img, picture, video, iframe, a, table");
        const hasText = el.textContent && el.textContent.trim().length > 0;
        if (!hasMedia && !hasText) {
          el.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        "link",
        "script",
        "noscript",
        "iframe",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("onload");
        el.removeAttribute("data-gtm");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/import-home-page.js
  var parsers = {
    "carousel-hero": parse,
    "carousel-promo": parse2,
    "carousel-icons": parse3,
    "cards-product": parse4,
    "cards-story": parse5,
    "cards-quicklink": parse6,
    "columns-feature": parse7
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "home-page",
    description: "Kotak Mahindra Bank home page with header navigation, hero banner carousel, product/quick-link column controls, thin promotional carousel, icon slider, overlay promotional sections, and a rich multi-column footer.",
    urls: [
      "https://www.kotak.bank.in/en/home.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [
          "div.heroslider.section"
        ]
      },
      {
        name: "cards-product",
        instances: [
          "div.white-background > div.columncontrol.section:nth-of-type(1)",
          "div.white-background > div.columncontrol.section:nth-of-type(2)"
        ]
      },
      {
        name: "carousel-promo",
        instances: [
          "div.white-background > div.thincarousalbanner.section"
        ]
      },
      {
        name: "columns-feature",
        instances: [
          "div.white-background > div.columncontrol.section:nth-of-type(4)"
        ]
      },
      {
        name: "cards-story",
        instances: [
          "div.white-background > div.parsys.section:nth-of-type(6)"
        ]
      },
      {
        name: "carousel-icons",
        instances: [
          "div.white-background > div.parsys.section:nth-of-type(7) > div.iconslider.section"
        ]
      },
      {
        name: "cards-quicklink",
        instances: [
          "div.white-background > div.columncontrol.section:nth-of-type(8)",
          "div.white-background > div.columncontrol.section:nth-of-type(9)"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_page_exports);
})();
