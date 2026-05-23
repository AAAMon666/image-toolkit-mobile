import { canvasToBlob, loadImageBitmap } from "@/lib/image/canvas";

export type CompressOptions = {
  maxWidth: number;
  quality: number;
  mimeType: "image/jpeg" | "image/webp";
};

export async function compressImage(file: File, options: CompressOptions) {
  const image = await loadImageBitmap(file);
  const scale = Math.min(1, options.maxWidth / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("浏览器不支持 Canvas");
  }

  context.drawImage(image.bitmap, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, options.mimeType, options.quality);
  image.bitmap.close();

  return {
    blob,
    width,
    height,
  };
}
