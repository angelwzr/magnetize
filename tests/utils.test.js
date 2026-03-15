const { formatBytes } = require('../server');

describe('formatBytes', () => {
  test('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1500)).toBe('1.46 KB');
  });

  test('handles custom decimals', () => {
    expect(formatBytes(1500, 0)).toBe('1 KB');
    expect(formatBytes(1500, 3)).toBe('1.465 KB');
  });
});
