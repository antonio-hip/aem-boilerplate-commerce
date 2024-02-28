import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const blockId = block.closest('.section').id;
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, index) => {
      const pic = col.querySelector('picture');
      const list = col.querySelector('ul');
      if (pic) {
        const picWrapper = pic.closest('div');
        const picImg = pic.querySelector('img');
        picWrapper.classList.add('columns-img-col');
        if (blockId && window.location.hash.includes(blockId) && index === 0) {
          pic.replaceWith(createOptimizedPicture('columns', picImg.src, picImg.alt, true));
        }

        pic.replaceWith(createOptimizedPicture('columns', picImg.src, picImg.alt, false));
      }

      if (list) {
        const textWrapper = list.closest('div');
        list.classList.add('columns-text-col-list');
        textWrapper.classList.add('columns-text-col');
      }
    });
  });
}
