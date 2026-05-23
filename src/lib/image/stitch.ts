import { canvasToBlob, loadImageBitmap } from "@/lib/image/canvas";

export type StitchInput = {
  file: File;
  id: string;
};

export type StitchOptions = {
  targetWidth: number;
  gap: number;
  background: string;
};

export async function stitchImages(
  items: StitchInput[],
  options: StitchOptions,
) {
  const images = await Promise.all(items.map((item) => loadImageBitmap(item.file)));
  const scaledHeights = images.map((image) =>
    Math.max(1, Math.round((image.height / image.width) * options.targetWidth)),
  );
  const totalHeight =
    scaledHeights.reduce((sum, current) => sum + current, 0) +
    Math.max(0, images.length - 1) * options.gap;

  const canvas = document.createElement("canvas");
  canvas.width = options.targetWidth;
  canvas.height = totalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("浏览器不支持 Canvas");
  }

  context.fillStyle = options.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  let offsetY = 0;
  images.forEach((image, index) => {
    const height = scaledHeights[index];
    context.drawImage(image.bitmap, 0, offsetY, options.targetWidth, height);
    offsetY += height + options.gap;
    image.bitmap.close();
  });

  const blob = await canvasToBlob(canvas, "image/png");

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
  };
}
