import { createOptimizedPicture } from '../../scripts/aem.js';

function createCarousel() {
  const carouselWrappers = document.querySelectorAll('.carousel-wrapper');

  carouselWrappers.forEach((carouselWrapper) => {
    const carousel = carouselWrapper.querySelector('.carousel');
    const carouselContainer = carouselWrapper.parentElement;
    const carouselSliderOption = carouselContainer.classList.contains('slider');
    const defaultWrapper = carouselContainer.querySelector('.default-content-wrapper');
    const h2 = defaultWrapper.querySelector('h2');
    const carouselMainWrapper = document.createElement('div');
    defaultWrapper.classList.remove('default-content-wrapper');
    defaultWrapper.classList.add('carousel-description');

    carouselContainer.prepend(h2);

    const pictures = [...carousel.querySelectorAll(':scope > div > div > picture')];

    pictures.forEach((picture) => {
      const img = picture.querySelector('img');
      if (carouselSliderOption) {
        picture.replaceWith(createOptimizedPicture('carousel-slider', img.src, img.alt, false));
      } else {
        picture.replaceWith(createOptimizedPicture('carousel', img.src, img.alt, false));
      }
    });

    const numSlides = [...carousel.querySelectorAll(':scope > div > div')].length;

    if (numSlides > 1) {
      if (carouselWrapper.querySelectorAll('.arrow').length === 2) {
        return;
      }

      const arrowsWrapper = document.createElement('div');
      arrowsWrapper.className = 'arrows-wrapper';

      const leftArrow = document.createElement('button');
      leftArrow.className = 'arrow button-icon icon';
      leftArrow.ariaLabel = 'left arrow';

      const rightArrow = document.createElement('button');
      rightArrow.className = 'arrow button-icon icon';
      rightArrow.ariaLabel = 'right arrow';

      const slideToRight = () => {
        let scrollAmount;

        if (!carouselSliderOption) {
          const firstItem = carousel.firstElementChild;
          carousel.insertBefore(firstItem, carousel.lastElementChild.nextElementSibling);

          const itemWidth = carouselWrapper.offsetWidth;
          scrollAmount = itemWidth;
        }

        if (carouselSliderOption) {
          const itemWidth = carouselWrapper.querySelector(':scope > div > div').offsetWidth;
          scrollAmount = itemWidth + 24;
        }

        carousel.scrollLeft += scrollAmount;
      };

      const slideToLeft = () => {
        let scrollAmount;

        if (!carouselSliderOption) {
          const lastItem = carousel.lastElementChild;
          carousel.insertBefore(lastItem, carousel.firstElementChild);

          const itemWidth = carouselWrapper.offsetWidth;
          scrollAmount = itemWidth;
        }

        if (carouselSliderOption) {
          const itemWidth = carouselWrapper.querySelector(':scope > div > div').offsetWidth;
          scrollAmount = itemWidth + 24;
        }

        carousel.scrollLeft -= scrollAmount;
      };

      fetch('/icons/border-arrow-left.svg')
        .then((response) => response.text())
        .then((svgContent) => {
          leftArrow.innerHTML = svgContent;
          leftArrow.addEventListener('click', slideToLeft);
        });

      fetch('/icons/border-arrow-right.svg')
        .then((response) => response.text())
        .then((svgContent) => {
          rightArrow.innerHTML = svgContent;
          rightArrow.addEventListener('click', () => {
            slideToRight();
          });
        });

      if (carouselSliderOption) {
        let isDown = false;
        let startX;
        let scrollLeft;

        const end = () => {
          isDown = false;
          carousel.classList.remove('active');
        };

        const start = (e) => {
          isDown = true;
          carousel.classList.add('active');
          startX = e.pageX || e.touches[0].pageX - carousel.offsetLeft;
          scrollLeft = carousel.scrollLeft;
        };

        const move = (e) => {
          if (!isDown) return;

          e.preventDefault();
          const x = e.pageX || e.touches[0].pageX - carousel.offsetLeft;
          const dist = x - startX;
          carousel.scrollLeft = scrollLeft - dist;
        };

        carousel.addEventListener('mousedown', start);
        carousel.addEventListener('touchstart', start);

        carousel.addEventListener('mousemove', move);
        carousel.addEventListener('touchmove', move);

        carousel.addEventListener('mouseleave', end);
        carousel.addEventListener('mouseup', end);
        carousel.addEventListener('touchend', end);
      }

      arrowsWrapper.appendChild(leftArrow);
      arrowsWrapper.appendChild(rightArrow);
      defaultWrapper.appendChild(arrowsWrapper);
      carouselMainWrapper.append(h2, defaultWrapper, carouselWrapper);
      carouselContainer.append(carouselMainWrapper);
    } else {
      carouselWrapper.classList.add('carousel-single-slide');
    }
  });
}

export default async function decorate() {
  createCarousel();
}
