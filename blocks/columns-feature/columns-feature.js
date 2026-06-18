/*
 * Fallback media for the campaign feature. The source video thumbnail is a below-the-fold
 * lazy image that the import tool drops; restore it at render time when the media cell is
 * empty so the side-by-side feature shows its thumbnail.
 */
const FALLBACK_MEDIA = {
  src: 'https://www.kotak.bank.in/content/dam/Kotak/video-thumbnails/homepage-yt-t-690x340.jpg',
  alt: 'Hausla hai toh ho jayega',
  href: 'https://www.youtube.com/embed/t7ZU1dCVpWU?autoplay=1',
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-feature-${cols.length}-cols`);

  // Restore a dropped media thumbnail into the first empty cell of the first row.
  const firstRow = block.firstElementChild;
  const mediaCol = firstRow && [...firstRow.children]
    .find((col) => !col.textContent.trim() && !col.querySelector('picture, img, iframe, video'));
  if (mediaCol) {
    const img = document.createElement('img');
    img.src = FALLBACK_MEDIA.src;
    img.alt = FALLBACK_MEDIA.alt;
    img.loading = 'lazy';
    const picture = document.createElement('picture');
    picture.append(img);
    const link = document.createElement('a');
    link.href = FALLBACK_MEDIA.href;
    link.append(picture);
    mediaCol.append(link);
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-feature-img-col');
        }
      }

      // mark empty cells so the layout can collapse them gracefully
      if (!col.textContent.trim() && !col.querySelector('picture, img, iframe, video')) {
        col.classList.add('columns-feature-empty');
      }
    });
  });
}
