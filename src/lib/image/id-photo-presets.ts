export type IdPhotoPreset = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export const idPhotoPresets: IdPhotoPreset[] = [
  { id: "one-inch", label: "一寸 295×413", width: 295, height: 413 },
  { id: "small-one-inch", label: "小一寸 260×378", width: 260, height: 378 },
  { id: "two-inch", label: "二寸 413×579", width: 413, height: 579 },
  { id: "exam", label: "报名照 300×400", width: 300, height: 400 },
];
