export const getCropRange = (width: number): [number, number] => {
  const minCropX = Math.ceil(width * (148 / 1920));
  const maxCropX = Math.ceil(width * (958 / 1920));
  return [minCropX, maxCropX - minCropX];
};
