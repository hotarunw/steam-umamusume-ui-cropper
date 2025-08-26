import { expect, test } from 'vitest';
import { getCropRange, getCropRangeNarrow } from './getCropRange';

test('getCropRange', () => {
  expect(getCropRange(1920, 1080)).toEqual([148, 958 - 148, 0, 1080]);
  expect(getCropRange(1650, (1650 * 9) / 16)).toEqual([127, 823 - 127, 0, (1650 * 9) / 16]);
  expect(getCropRange(1463, (1463 * 9) / 16)).toEqual([113, 730 - 113, 0, (1463 * 9) / 16]);
  expect(getCropRange(1221, (1221 * 9) / 16)).toEqual([94, 609 - 94, 0, (1221 * 9) / 16]);
});

test('getCropRangeNarrow', () => {
  expect(getCropRangeNarrow(1920, 1080)).toEqual([256, 850 - 256, 27, 1056 - 27]);
  expect(getCropRangeNarrow(1495, 841)).toEqual([199, 662 - 199, 21, 822 - 21]);
  expect(getCropRangeNarrow(1497, 842)).toEqual([199, 663 - 199, 21, 823 - 21]);
});
