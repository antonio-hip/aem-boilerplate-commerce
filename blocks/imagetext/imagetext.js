import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  [...block.children].forEach((child) => {
    [...child.children].forEach((col) => {
      const picture = col.querySelector('picture');
      const newPicture = picture.cloneNode(true);
      const newPictureImg = newPicture.querySelector('img');
      child.prepend(newPicture);
      picture.parentElement.remove();
      newPicture.replaceWith(createOptimizedPicture('imagetext', newPictureImg.src, newPictureImg.alt, false));
    });
  });
}
