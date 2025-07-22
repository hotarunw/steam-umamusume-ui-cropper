export const getCropRange = (width: number): [number, number] => {
  const minCropX = Math.round(width * (148 / 1920));
  const maxCropX = Math.round(width * (958 / 1920));
  return [minCropX, maxCropX - minCropX];
};
