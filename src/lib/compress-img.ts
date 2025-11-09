import "client-only";

const ONE_MB = 1024;
const ONE_HUNDRED = 100;

// More than needed, but less than the phone can do
const MAX_DIMENSION = 3000;

const HIGH_QUALITY = 0.92;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// biome-ignore lint/suspicious/useAwait: We need to use a promise here
export async function compressImage(file: File): Promise<File> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  if (file.size < ONE_MB * ONE_MB) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error("Failed to load image"));

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (Math.max(width, height) > MAX_DIMENSION) {
          if (width > height) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          } else {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG with high quality (not WebP - for compatibility)
        // Server will do the final optimization
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // Log the result
            const originalMB = (file.size / ONE_MB / ONE_MB).toFixed(2);
            const compressedMB = (
              compressedFile.size /
              ONE_MB /
              ONE_MB
            ).toFixed(2);
            const reduction = (
              ((file.size - compressedFile.size) / file.size) *
              ONE_HUNDRED
            ).toFixed(1);

            // biome-ignore lint/suspicious/noConsole: We need to log the result
            console.log(
              `Client compression: ${originalMB}MB → ${compressedMB}MB (${reduction}% reduction)`
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          HIGH_QUALITY // High quality - server will compress it further
        );
      };
    };
  });
}
