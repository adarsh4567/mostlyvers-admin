import { describe, expect, it } from 'vitest';
import { validateUploadUrl } from './uploads';

describe('validateUploadUrl', () => {
  it('accepts an absolute local upload URL', () => {
    expect(validateUploadUrl('http://localhost:9000/mostlyvers-private/book.epub')).toBe(
      'http://localhost:9000/mostlyvers-private/book.epub',
    );
  });

  it('rejects a Markdown-formatted endpoint', () => {
    expect(() => validateUploadUrl('[http://localhost:9000](http://localhost:9000)/book.epub')).toThrow(
      /R2_PRESIGN_ENDPOINT/,
    );
  });
});
