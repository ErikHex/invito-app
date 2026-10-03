import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePhotoUpload, canUploadPhoto } from '../src/lib/media-upload.js';

const eventoId = 'a1234567-1234-1234-1234-123456789abc';
const photo = { eventoId, contentType: 'image/webp', size: 1024 };

test('rejects invalid keys, unsupported types and invalid sizes', () => {
  for (const input of [null, {}, { ...photo, eventoId: '../otro' }, { ...photo, contentType: 'image/svg+xml' },
    { ...photo, contentType: 'constructor' }, ...[0, -1, 0.5, '1024', 8 * 1024 * 1024 + 1].map(size => ({ ...photo, size }))]) {
    assert.equal(validatePhotoUpload(input), null);
  }
  assert.equal(validatePhotoUpload(photo).extension, 'webp');
  assert.ok(validatePhotoUpload({ ...photo, size: 8 * 1024 * 1024 }));
});

test('only an active titular or admin of the requested event may upload', () => {
  for (const rol of ['admin', 'titular']) assert.equal(canUploadPhoto({ eventos: [{ id: eventoId, rol }] }, eventoId), true);
  for (const session of [null, {}, { admin: true }, { eventos: [] },
    { eventos: [{ id: eventoId, rol: 'portero' }] }, { eventos: [{ id: 'otro', rol: 'titular' }] }]) {
    assert.equal(canUploadPhoto(session, eventoId), false);
  }
});
