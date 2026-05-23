export const ratioOptions = [
  { key: "square", label: "1:1", hint: "适合头像、商品主图", width: 1, height: 1 },
  { key: "landscape", label: "4:3", hint: "适合文章配图、内容插图", width: 4, height: 3 },
  { key: "poster", label: "3:4", hint: "适合人物海报、竖版封面", width: 3, height: 4 },
  { key: "banner", label: "16:9", hint: "适合横幅、网页首屏、视频封面", width: 16, height: 9 },
  { key: "mobile", label: "9:16", hint: "适合手机海报、短视频封面", width: 9, height: 16 },
] as const;

export const qualityOptions = [
  { key: "1k", label: "1K", longEdge: 1024 },
  { key: "2k", label: "2K", longEdge: 2048 },
  { key: "4k", label: "4K", longEdge: 4096 },
] as const;

export type RatioKey = (typeof ratioOptions)[number]["key"];
export type QualityKey = (typeof qualityOptions)[number]["key"];

export function getRatioDimensions(ratioKey: RatioKey) {
  const selected = ratioOptions.find((item) => item.key === ratioKey) ?? ratioOptions[0];

  return {
    width: selected.width,
    height: selected.height,
  };
}

export function mapRenderSize(ratioKey: RatioKey, qualityKey: QualityKey) {
  const ratio = getRatioDimensions(ratioKey);
  const quality = qualityOptions.find((item) => item.key === qualityKey) ?? qualityOptions[0];

  const landscape = ratio.width >= ratio.height;
  const longEdge = quality.longEdge;
  const shortEdge = Math.round((Math.min(ratio.width, ratio.height) / Math.max(ratio.width, ratio.height)) * longEdge);

  const width = landscape ? longEdge : shortEdge;
  const height = landscape ? shortEdge : longEdge;

  return {
    width,
    height,
    size: `${width}x${height}`,
  };
}
