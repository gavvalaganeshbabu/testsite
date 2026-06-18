import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Fallback images keyed by card heading. The source uses below-the-fold lazy-loaded
 * "random-logic" cards whose images the import tool intermittently drops; this lookup
 * lets the block restore the correct photo at render time when an image cell is empty.
 */
const FALLBACK_IMAGES = {
  'step up with the right savings account': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/everyday-sa-feature-cad-t.jpg', alt: 'Everyday Savings Account' },
  'backing you with every swipe': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/811-super.jpeg', alt: '811 Super' },
  'hassle free home loans tailored for your needs!': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/home-loan-feature-card.jpg', alt: 'Home Loan' },
  'enjoy exclusive offers with kotak credit cards': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/cc-card-358-x-201.jpg', alt: 'Credit Cards' },
  'your goals need systematic investments': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/mutual-funds-feature-card-t.jpg', alt: 'Mutual Funds' },
  'save, trade, & invest smartly': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/3-in-1-trinity-t.jpg', alt: '3-in-1 Trinity Account' },
  'dissolving distances. powering ambitions': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/nri-services-feature-card-t.jpg', alt: 'NRI Services' },
  'power your aspirations with personal loans': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/pl-feature-card-t.jpg', alt: 'Personal Loan' },
  'power your entrepreneurial dreams': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/current-account-feature-card-t.jpg', alt: 'Current Account' },
  'not enough funds for your business dreams?': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/business-capital-feature-card-t.jpg', alt: 'Business Lending' },
  'hausla empowered': { src: 'https://www.kotak.bank.in/content/dam/Kotak/feature-cards/bizlabs-docuseries-feature-card.jpg', alt: 'Kotak BizLabs Docuseries' },
};

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div, i) => {
      // First cell holds the image (may be empty); remaining cell holds the body.
      if (i === 0 || (div.children.length === 1 && div.querySelector('picture'))) div.className = 'cards-product-card-image';
      else div.className = 'cards-product-card-body';
    });

    // Restore a dropped image from the heading-keyed fallback map.
    const imageCell = li.querySelector('.cards-product-card-image');
    if (imageCell && !imageCell.querySelector('img')) {
      const heading = li.querySelector('.cards-product-card-body h4, .cards-product-card-body h3, .cards-product-card-body h2');
      const key = heading?.textContent.trim().toLowerCase();
      const fallback = key && FALLBACK_IMAGES[key];
      if (fallback) {
        const img = document.createElement('img');
        img.src = fallback.src;
        img.alt = fallback.alt;
        img.loading = 'lazy';
        const picture = document.createElement('picture');
        picture.append(img);
        imageCell.append(picture);
      }
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
