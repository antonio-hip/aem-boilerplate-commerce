import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  const logo = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  fetch('/icons/logo.svg')
    .then((response) => response.text())
    .then((svgContent) => {
      logo.innerHTML = svgContent;
    });

  footer.append(logo);
  block.append(footer);
}
