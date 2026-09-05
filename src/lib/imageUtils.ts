/**
 * Client-side image compression and conversion utility.
 * Optimizes large camera photos (e.g. iPhone 12MP/48MP HEIC/JPEG) into lightweight,
 * standard JPEG files (max 1920px, ~300KB) before uploading to S3.
 */

export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82
): Promise<File> {
  // If not a recognized image type, return as is
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    return file;
  }

  try {
    // 1. Try modern createImageBitmap first (hardware accelerated, faster on mobile)
    if (typeof window !== "undefined" && "createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(file);
        let { width, height } = bitmap;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, width, height);
          bitmap.close();

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality)
          );

          if (blob) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            return new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
          }
        }
      } catch (bitmapError) {
        console.warn("createImageBitmap failed, falling back to Image element:", bitmapError);
      }
    }

    // 2. Fallback to HTMLImageElement + URL.createObjectURL
    return await new Promise<File>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            resolve(
              new File([blob], cleanName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file); // Fallback to original file
      };

      img.src = objectUrl;
    });
  } catch (err) {
    console.error("Image compression error, proceeding with original file:", err);
    return file;
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
