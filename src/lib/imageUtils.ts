/**
 * Image processing utilities for fiki_driver.
 * Powered by centralized imageOptimization pipeline supporting HEIC/HEIF and camera photos.
 */

import {
  optimizeImage,
  fileToBase64,
  isHeic,
  validateImageFile,
  uploadOptimizedFile,
  ACCEPTED_IMAGE_TYPES,
} from "./imageOptimization";

export {
  optimizeImage,
  fileToBase64,
  isHeic,
  validateImageFile,
  uploadOptimizedFile,
  ACCEPTED_IMAGE_TYPES,
};

/**
 * Backward-compatible wrapper for compressImage.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1440,
  quality = 0.85
): Promise<File> {
  return optimizeImage(file, {
    maxWidth,
    maxHeight,
    quality,
    preset: "odometer",
  });
}
