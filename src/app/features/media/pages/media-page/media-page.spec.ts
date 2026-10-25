import { describe, expect, it } from 'vitest';
import { matchesMediaFilter } from './media-page';

describe('matchesMediaFilter', () => {
  it('shows only images when the image filter is active', () => {
    expect(matchesMediaFilter('IMAGE', 'IMAGE')).toBe(true);
    expect(matchesMediaFilter('VIDEO', 'IMAGE')).toBe(false);
    expect(matchesMediaFilter('PODCAST', 'IMAGE')).toBe(false);
  });
});
