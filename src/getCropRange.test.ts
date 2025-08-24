import { expect, test } from 'vitest';
import { getCropRange, getCropRangeNarrow } from './getCropRange';

// TODO: hogehoge
test('getCropRange', () => {
  expect(getCropRange(1920, 1080)).toEqual([148, 958 - 148, 0, 1080]);
  expect(getCropRange(1650, (1650 * 9) / 16)).toEqual([127, 823 - 127, 0, (1650 * 9) / 16]);
  expect(getCropRange(1463, (1463 * 9) / 16)).toEqual([113, 730 - 113, 0, (1463 * 9) / 16]);
  expect(getCropRange(1221, (1221 * 9) / 16)).toEqual([94, 609 - 94, 0, (1221 * 9) / 16]);
});

test('getCropRangeNarrow', () => {
  expect(getCropRangeNarrow(1920, 1080)).toEqual([256, 850 - 256, 0, 1080]);
  expect(getCropRangeNarrow(1451, (1451 * 9) / 16)).toEqual([206, 682 - 206, 0, (1451 * 9) / 16]);
  expect(getCropRangeNarrow(1463, (1463 * 9) / 16)).toEqual([230, 761 - 230, 0, (1463 * 9) / 16]);
});
