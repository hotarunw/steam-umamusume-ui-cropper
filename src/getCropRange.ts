export const getCropRange = (width: number, height: number): [number, number, number, number] => {
  const minCropX = Math.round(width * (148 / 1920));
  const maxCropX = Math.round(width * (958 / 1920));
  return [minCropX, maxCropX - minCropX, 0, height];
};

export const getCropRangeNarrow = (
  width: number,
  height: number
): [number, number, number, number] => {
  const minCropX = roundByThreshold((width * 256) / 1920, 0.7);
  const maxCropX = roundByThreshold((width * 850) / 1920, 0.7);
  const minCropY = Math.round((height * 27) / 1080);
  const maxCropY = Math.round((height * 1056) / 1080);
  return [minCropX, maxCropX - minCropX, minCropY, maxCropY - minCropY];
};

const roundByThreshold = (value: number, threshold: number): number => {
  const integerPart = Math.floor(value);
  const decimalPart = value - integerPart;

  return decimalPart >= threshold ? integerPart + 1 : integerPart;
};
