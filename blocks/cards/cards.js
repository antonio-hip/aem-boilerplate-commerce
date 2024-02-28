import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const blockId = block.closest('.section.grid-view').id;
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img, index) => {
    if (blockId && window.location.hash.includes(blockId) && index === 0) {
      img.closest('picture').replaceWith(createOptimizedPicture('cards', img.src, img.alt, true));
    }
    img.closest('picture').replaceWith(createOptimizedPicture('cards', img.src, img.alt, false));
  });
  block.textContent = '';
  block.append(ul);
}
