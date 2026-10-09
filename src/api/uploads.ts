import { adminApi } from './client';

interface UploadSession { uploadId: string; partSize: number; fileName: string }
interface SignedParts { parts: Array<{ partNumber: number; url: string; headers: Record<string, string> }> }

export const validateUploadUrl = (value: string) => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('The backend returned an invalid upload URL. Check R2_PRESIGN_ENDPOINT (local value: http://localhost:9000).');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('The backend returned an unsupported upload URL.');
  }
  return parsed.toString();
};

const putPart = (url: string, blob: Blob, headers: Record<string, string>, onProgress: (loaded: number) => void) => new Promise<string>((resolve, reject) => {
  const request = new XMLHttpRequest(); request.open('PUT', validateUploadUrl(url));
  Object.entries(headers).forEach(([key, value]) => { if (!['host', 'content-length', 'origin'].includes(key.toLowerCase())) request.setRequestHeader(key, value); });
  request.upload.onprogress = event => onProgress(event.loaded);
  request.onerror = () => reject(new Error('Upload interrupted. You can retry without losing the selected file.'));
  request.onload = () => request.status >= 200 && request.status < 300 ? resolve(request.getResponseHeader('ETag') || '') : reject(new Error('A file part could not be uploaded.'));
  request.send(blob);
});

export async function uploadPrivateFile(file: File, kind: 'BOOK_COVER' | 'EPUB' | 'PROFILE_IMAGE' | 'AUTHOR_PHOTO' | 'OWNER_PHOTO', progress: (percent: number) => void = () => undefined) {
	if (kind !== 'EPUB') {
		const form = new FormData(); form.append('kind', kind); form.append('file', file);
		progress(10);
		const result = await adminApi.postForm<{ uploadRef: string; status: string; url: string }>('/admin/media', form);
		progress(100);
		return result;
	}
  const checksum = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))).map(value => value.toString(16).padStart(2, '0')).join('');
  const session = await adminApi.post<UploadSession>('/admin/uploads', { kind, fileName: file.name, contentType: file.type || 'application/octet-stream', size: file.size, checksumSha256: checksum });
  const partCount = Math.ceil(file.size / session.partSize) || 1;
  const partNumbers = Array.from({ length: partCount }, (_, index) => index + 1);
  const signed = await adminApi.post<SignedParts>(`/admin/uploads/${session.uploadId}/parts`, { partNumbers });
  const completed: Array<{ partNumber: number; etag: string }> = []; let uploaded = 0;
  for (const part of signed.parts) {
    const start = (part.partNumber - 1) * session.partSize; const blob = file.slice(start, Math.min(start + session.partSize, file.size));
    let previous = 0;
    const etag = await putPart(part.url, blob, part.headers, loaded => { uploaded += loaded - previous; previous = loaded; progress(Math.round((uploaded / Math.max(file.size, 1)) * 100)); });
    completed.push({ partNumber: part.partNumber, etag });
  }
  return adminApi.post<{ uploadRef: string; status: string }>(`/admin/uploads/${session.uploadId}/complete`, { parts: completed, checksumSha256: checksum });
}
