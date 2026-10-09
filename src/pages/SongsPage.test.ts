import { describe, expect, it } from 'vitest';
import { validYoutube } from './SongsPage';

describe('YouTube URL validation', () => {
  it('accepts only HTTPS YouTube hosts', () => {
    expect(validYoutube('https://youtu.be/abc')).toBe(true);
    expect(validYoutube('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(validYoutube('http://youtube.com/watch?v=abc')).toBe(false);
    expect(validYoutube('https://youtube.example.com/watch?v=abc')).toBe(false);
  });
});
