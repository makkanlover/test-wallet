import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with environment variables', () => {
    expect(process.env.VITE_DEFAULT_NETWORK).toBe('goerli');
  });
});