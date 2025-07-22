import { expect, test } from 'vitest';
import { getCropRange } from './getCropRange';

test('getCropRange', () => {
  expect(getCropRange(1920)).toEqual([148, 958 - 148]);
  expect(getCropRange(1650)).toEqual([127, 823 - 127]);
  expect(getCropRange(1463)).toEqual([113, 730 - 113]);
  expect(getCropRange(1221)).toEqual([94, 609 - 94]);
});
