import { canvasToBlob, loadImageBitmap } from "@/lib/image/canvas";
import type { IdPhotoPreset } from "@/lib/image/id-photo-presets";

export type CropState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export async function renderIdPhoto(
  file: File,
  preset: IdPhotoPreset,
  crop: CropState,
) {
  const image = await loadImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("浏览器不支持 Canvas");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const baseScale = Math.max(
    preset.width / image.width,
    preset.height / image.height,
  );
  const drawWidth = image.width * baseScale * crop.scale;
  const drawHeight = image.height * baseScale * crop.scale;
  const x = (preset.width - drawWidth) / 2 + crop.offsetX;
  const y = (preset.height - drawHeight) / 2 + crop.offsetY;

  context.drawImage(image.bitmap, x, y, drawWidth, drawHeight);

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
  image.bitmap.close();

  return {
    blob,
    width: preset.width,
    height: preset.height,
  };
}
