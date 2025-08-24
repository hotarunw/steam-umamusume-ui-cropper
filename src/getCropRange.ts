export const getCropRange = (width: number, height: number): [number, number, number, number] => {
  const minCropX = Math.round(width * (148 / 1920));
  const maxCropX = Math.round(width * (958 / 1920));
  return [minCropX, maxCropX - minCropX, 0, height];
};

export const getCropRangeNarrow = (
  width: number,
  height: number
): [number, number, number, number] => {
  const minCropX = Math.round(width * (256 / 1920));
  const maxCropX = Math.round(width * (850 / 1920));
  return [minCropX, maxCropX - minCropX, 0, height];
};
