import { readBlockConfig, buildBlock } from '../../scripts/aem.js';
import { performCatalogServiceQuery, renderPrice } from '../../scripts/commerce.js';



const productTeaserQuery = `query productTeaser($sku: String!) {
  products(skus: [$sku]) {
    sku
    urlKey
    name
    addToCartAllowed
    __typename
    images(roles: ["small_image"]) {
      label
      url
    }
    ... on SimpleProductView {
      price {
        ...priceFields
      }
    }
    ... on ComplexProductView {
      priceRange {
        minimum {
          ...priceFields
        }
        maximum {
          ...priceFields
        }
      }
    }
  }
}
fragment priceFields on ProductViewPrice {
  regular {
    amount {
      currency
      value
    }
  }
  final {
    amount {
      currency
      value
    }
  }
}`;

async function createCarousel(block) {
  const carouselWrappers = document.querySelectorAll('.carousel-wrapper');

  for (const carouselWrapper of carouselWrappers) {
    const carousel = carouselWrapper.querySelector('.carousel');
    const carouselContainer = carouselWrapper.parentElement;
    const carouselSliderOption = carouselContainer.classList.contains('slider');
    const defaultWrapper = carouselContainer.querySelector('.default-content-wrapper');
    const h2 = defaultWrapper.querySelector('h2');
    const carouselMainWrapper = document.createElement('div');
    defaultWrapper.classList.remove('default-content-wrapper');
    defaultWrapper.classList.add('carousel-description');

    carouselContainer.prepend(h2);

    const pictures = [...carousel.querySelectorAll(':scope > div > div > table')];

    // eslint-disable-next-line no-restricted-syntax
    for (const picture of pictures) {
      const img = picture.querySelector('img');
      if (carouselSliderOption) {
        const teaserBlock = buildBlock('product-teaser', '<table>\n' +
          '                <tbody>\n' +
          '                  <tr>\n' +
          '                    <td colspan="2"><strong>Product Teaser</strong></td>\n' +
          '                  </tr>\n' +
          '                  <tr>\n' +
          '                    <td>SKU</td>\n' +
          '                    <td>24-MB02</td>\n' +
          '                  </tr>\n' +
          '                  <tr>\n' +
          '                    <td>Details Button</td>\n' +
          '                    <td>true</td>\n' +
          '                  </tr>\n' +
          '                  <tr>\n' +
          '                    <td>Cart Button</td>\n' +
          '                    <td>true</td>\n' +
          '                  </tr>\n' +
          '                </tbody>\n' +
          '              </table>');
        // eslint-disable-next-line no-await-in-loop,no-use-before-define
        const productTeaser = await decorateTeaser(teaserBlock);
        picture.replaceWith(productTeaser);
      } else {
        // eslint-disable-next-line no-use-before-define,no-await-in-loop
        const productTeaser = await decorateTeaser(teaserBlock);
        picture.replaceWith(productTeaser);
      }
    }

    const numSlides = [...carousel.querySelectorAll(':scope > div > div')].length;

    if (numSlides > 1) {
      if (carouselWrapper.querySelectorAll('.arrow').length === 2) {
        continue;
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
  }
}

export default async function decorate(block) {
  createCarousel(block);
}

function renderPlaceholder(config, block) {
  block.textContent = '';
  block.appendChild(document.createRange().createContextualFragment(`
    <div class="image">
      <div class="placeholder"></div>
    </div>
    <div class="details">
      <h1></h1>
      <div class="price"></div>
      <div class="actions">
        ${config['details-button'] ? '<a href="#" class="button primary disabled">Details</a>' : ''}
        ${config['cart-button'] ? '<button class="secondary" disabled>Add to Cart</button>' : ''}
      </div>
    </div>
  `));
}

function renderImage(image, size = 250) {
  const { url: imageUrl, label } = image;
  const createUrlForWidth = (url, w, useWebply = true) => {
    const newUrl = new URL(url, window.location);
    if (useWebply) {
      newUrl.searchParams.set('format', 'webply');
      newUrl.searchParams.set('optimize', 'medium');
    } else {
      newUrl.searchParams.delete('format');
    }
    newUrl.searchParams.set('width', w);
    newUrl.searchParams.delete('quality');
    newUrl.searchParams.delete('dpr');
    newUrl.searchParams.delete('bg-color');
    return newUrl.toString();
  };

  const createUrlForDpi = (url, w, useWebply = true) => `${createUrlForWidth(url, w, useWebply)} 1x, ${createUrlForWidth(url, w * 2, useWebply)} 2x, ${createUrlForWidth(url, w * 3, useWebply)} 3x`;

  const webpUrl = createUrlForDpi(imageUrl, size, true);
  const jpgUrl = createUrlForDpi(imageUrl, size, false);

  return document.createRange().createContextualFragment(`<picture>
      <source srcset="${webpUrl}" />
      <source srcset="${jpgUrl}" />
      <img height="${size}" width="${size}" src="${createUrlForWidth(imageUrl, size, false)}" loading="eager" alt="${label}" />
    </picture>
  `);
}

function renderProduct(product, config, block) {
  const {
    name, urlKey, sku, price, priceRange, addToCartAllowed, __typename,
  } = product;

  const currency = price?.final?.amount?.currency || priceRange?.minimum?.final?.amount?.currency;
  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  block.textContent = '';
  const fragment = document.createRange().createContextualFragment(`
    <div class="image">
    </div>
    <div class="details">
      <h1>${name}</h1>
      <div class="price">${renderPrice(product, priceFormatter.format)}</div>
      <div class="actions">
        ${config['details-button'] ? `<a href="/products/${urlKey}/${sku}" class="button primary">Details</a>` : ''}
        ${config['cart-button'] && addToCartAllowed && __typename === 'SimpleProductView' ? '<button class="add-to-cart secondary">Add to Cart</button>' : ''}
      </div>
    </div>
  `);

  fragment.querySelector('.image').appendChild(renderImage(product.images[0], 250));

  const addToCartButton = fragment.querySelector('.add-to-cart');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', async () => {
      const { cartApi } = await import('../../scripts/minicart/api.js');
      // TODO: productId not exposed by catalog service as number
      window.adobeDataLayer.push({ productContext: { productId: 0, ...product } });
      cartApi.addToCart(product.sku, [], 1, 'product-teaser');
    });
  }
  block.appendChild(fragment);
  return block;
}

export async function decorateTeaser(block) {
  const config = readBlockConfig(block);
  config['details-button'] = !!(config['details-button'] || config['details-button'] === 'true');
  config['cart-button'] = !!(config['cart-button'] || config['cart-button'] === 'true');

  renderPlaceholder(config, block);

  const { products } = await performCatalogServiceQuery(productTeaserQuery, {
    sku: config.sku,
  });
  if (!products || !products.length > 0 || !products[0].sku) {
    return;
  }
  const [product] = products;
  product.images = product.images.map((image) => ({ ...image, url: image.url.replace(/^https?:/, '') }));

  const html = renderProduct(product, config, block);
  const htmlElem = document.createElement('div');
  htmlElem.appendChild(html);
  return htmlElem;
}
