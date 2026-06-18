/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import carouselIconsParser from './parsers/carousel-icons.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsStoryParser from './parsers/cards-story.js';
import cardsQuicklinkParser from './parsers/cards-quicklink.js';
import columnsFeatureParser from './parsers/columns-feature.js';

// TRANSFORMER IMPORTS
import kotakCleanupTransformer from './transformers/kotak-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'carousel-promo': carouselPromoParser,
  'carousel-icons': carouselIconsParser,
  'cards-product': cardsProductParser,
  'cards-story': cardsStoryParser,
  'cards-quicklink': cardsQuicklinkParser,
  'columns-feature': columnsFeatureParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  kotakCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home-page',
  description: 'Kotak Mahindra Bank home page with header navigation, hero banner carousel, product/quick-link column controls, thin promotional carousel, icon slider, overlay promotional sections, and a rich multi-column footer.',
  urls: [
    'https://www.kotak.bank.in/en/home.html',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: [
        'div.heroslider.section',
      ],
    },
    {
      name: 'cards-product',
      instances: [
        'div.white-background > div.columncontrol.section:nth-of-type(1)',
        'div.white-background > div.columncontrol.section:nth-of-type(2)',
      ],
    },
    {
      name: 'carousel-promo',
      instances: [
        'div.white-background > div.thincarousalbanner.section',
      ],
    },
    {
      name: 'columns-feature',
      instances: [
        'div.white-background > div.columncontrol.section:nth-of-type(4)',
      ],
    },
    {
      name: 'cards-story',
      instances: [
        'div.white-background > div.parsys.section:nth-of-type(6)',
      ],
    },
    {
      name: 'carousel-icons',
      instances: [
        'div.white-background > div.parsys.section:nth-of-type(7) > div.iconslider.section',
      ],
    },
    {
      name: 'cards-quicklink',
      instances: [
        'div.white-background > div.columncontrol.section:nth-of-type(8)',
        'div.white-background > div.columncontrol.section:nth-of-type(9)',
      ],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
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

    // 4. afterTransform cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
