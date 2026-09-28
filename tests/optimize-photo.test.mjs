import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizePhoto } from '../src/lib/optimize-photo.js';

function browser(t, { width = 4000, height = 3000, output = new Blob(['webp'], { type: 'image/webp' }), broken = false, context = true } = {}) {
  const draws = [];
  const encodings = [];
  const revoked = [];
  const canvas = {
    width: 0, height: 0,
    getContext: () => context ? { drawImage: (...args) => draws.push(args.slice(1)) } : null,
    toBlob(callback, type, quality) { encodings.push([this.width, this.height, type, quality]); callback(output); },
  };
  class TestImage {
    naturalWidth = width;
    naturalHeight = height;
    set src(value) { queueMicrotask(() => broken ? this.onerror() : this.onload()); }
  }
  const oldImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: TestImage });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => canvas } });
  t.mock.method(URL, 'createObjectURL', () => 'blob:test-photo');
  t.mock.method(URL, 'revokeObjectURL', url => revoked.push(url));
  t.after(() => {
    if (oldImage) Object.defineProperty(globalThis, 'Image', oldImage); else delete globalThis.Image;
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument); else delete globalThis.document;
  });
  return { canvas, draws, encodings, revoked, output };
}

const photo = () => new Blob([new Uint8Array(1000)], { type: 'image/jpeg' });

test('large landscape photo becomes smaller WebP with preserved proportions and released resources', async t => {
  const b = browser(t);
  const result = await optimizePhoto(photo());
  assert.equal(result, b.output);
  assert.deepEqual(b.draws, [[0, 0, 1920, 1440]]);
  assert.deepEqual(b.encodings, [[1920, 1440, 'image/webp', 0.82]]);
  assert.deepEqual(b.revoked, ['blob:test-photo']);
  assert.equal(b.canvas.width, 0);
  assert.equal(b.canvas.height, 0);
});

test('portrait photos are resized with preserved proportions', async t => {
  const b = browser(t, { width: 2400, height: 3600 });
  await optimizePhoto(photo());
  assert.deepEqual(b.draws, [[0, 0, 1280, 1920]]);
});

test('small photos keep their dimensions', async t => {
  const b = browser(t, { width: 600, height: 900 });
  await optimizePhoto(photo());
  assert.deepEqual(b.draws, [[0, 0, 600, 900]]);
});

test('unsupported WebP encoding retains the original bytes and MIME type', async t => {
  browser(t, { output: new Blob(['png'], { type: 'image/png' }) });
  const original = photo();
  assert.equal(await optimizePhoto(original), original);
});

test('conversion never increases the file size', async t => {
  browser(t, { output: new Blob([new Uint8Array(2000)], { type: 'image/webp' }) });
  const original = photo();
  assert.equal(await optimizePhoto(original), original);
});

test('unreadable photos fail with an actionable message and release the object URL', async t => {
  const b = browser(t, { broken: true });
  await assert.rejects(optimizePhoto(photo()), /No se pudo leer/);
  assert.deepEqual(b.revoked, ['blob:test-photo']);
});

test('failed encoding releases canvas memory and does not upload an empty image', async t => {
  const b = browser(t, { output: null });
  await assert.rejects(optimizePhoto(photo()), /No se pudo convertir/);
  assert.equal(b.canvas.width, 0);
  assert.deepEqual(b.revoked, ['blob:test-photo']);
});

test('missing canvas support reports a processing error', async t => {
  const b = browser(t, { context: false });
  await assert.rejects(optimizePhoto(photo()), /No se pudo procesar/);
  assert.deepEqual(b.revoked, ['blob:test-photo']);
});
