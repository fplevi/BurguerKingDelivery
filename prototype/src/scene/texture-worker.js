// Texture worker: paints the recipes it is sent, off the page's main thread, and hands
// back one ImageBitmap per canvas (transferred, not copied).
import { paint } from './texture-recipes.js';

self.onmessage = ({ data: { keys } }) => {
  for (const key of keys) {
    const bitmaps = paint(key, (size) => new OffscreenCanvas(size, size)).map((c) => c.transferToImageBitmap());
    self.postMessage({ key, bitmaps }, bitmaps);
  }
};
