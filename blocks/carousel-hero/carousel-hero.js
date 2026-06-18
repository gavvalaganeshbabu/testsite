export default function decorate(block) {
  const slides = [...block.children];

  const slidesWrapper = document.createElement('div');
  slidesWrapper.classList.add('carousel-hero-slides');

  slides.forEach((slide) => {
    slide.classList.add('carousel-hero-slide');
    slidesWrapper.appendChild(slide);
  });

  block.innerHTML = '';
  block.appendChild(slidesWrapper);

  let currentSlide = 0;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-hero-arrow carousel-hero-prev';
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-hero-arrow carousel-hero-next';
  nextBtn.innerHTML = '&#10095;';

  block.append(prevBtn, nextBtn);

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-hero-dots';

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-hero-dot';

    dot.addEventListener('click', () => {
      currentSlide = index;
      updateCarousel();
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  block.appendChild(dotsContainer);

  function updateCarousel() {
    slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  prevBtn.addEventListener('click', () => {
    currentSlide =
      currentSlide === 0 ? slides.length - 1 : currentSlide - 1;

    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentSlide =
      currentSlide === slides.length - 1 ? 0 : currentSlide + 1;

    updateCarousel();
  });

  setInterval(() => {
    currentSlide =
      currentSlide === slides.length - 1 ? 0 : currentSlide + 1;

    updateCarousel();
  }, 5000);

  updateCarousel();
}