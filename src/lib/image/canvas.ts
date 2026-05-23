export type LoadedImage = {
  bitmap: ImageBitmap;
  width: number;
  height: number;
};

export async function loadImageBitmap(file: File) {
  const bitmap = await createImageBitmap(file);
  return {
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
  } satisfies LoadedImage;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("导出图片失败"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}
