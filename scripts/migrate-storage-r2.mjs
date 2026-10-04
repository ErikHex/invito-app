import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Run from the project root: node --env-file=.env.local scripts/migrate-storage-r2.mjs
// Input is a separately captured DB/storage snapshot. This script never changes the DB.
const directory = 'backups/r2-migration';
const snapshot = JSON.parse(await readFile(`${directory}/source.json`, 'utf8'));
const source = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fotos_eventos/`;
const target = process.env.R2_PUBLIC_URL.replace(/\/$/, '') + '/';
if (process.env.R2_BUCKET !== 'invito-media' || target !== 'https://cdn.invito.fun/') throw new Error('Unexpected destination');
const client = new S3Client({ region: 'auto', endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: 'WHEN_REQUIRED', maxAttempts: 3 });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = name => name.split('/').map(encodeURIComponent).join('/');
const report = [];
await mkdir(`${directory}/objects`, { recursive: true });
for (const object of snapshot.objects) {
  const response = await fetch(source + encode(object.name), { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}: ${object.name}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== object.metadata.size) throw new Error(`Source size changed: ${object.name}`);
  const digest = hash(bytes);
  await writeFile(`${directory}/objects/${object.id}`, bytes);
  let exists = false;
  try {
    const existing = await client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: object.name }));
    if (hash(await existing.Body.transformToByteArray()) !== digest) throw new Error(`Destination collision: ${object.name}`);
    exists = true;
  } catch (error) {
    if (error.$metadata?.httpStatusCode !== 404) throw error;
  }
  if (!exists) await client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: object.name,
    Body: bytes, ContentType: object.metadata.mimetype, CacheControl: 'public, max-age=3600', IfNoneMatch: '*' }));
  const publicUrl = target + encode(object.name);
  const check = await fetch(publicUrl, { signal: AbortSignal.timeout(60000) });
  if (!check.ok || hash(Buffer.from(await check.arrayBuffer())) !== digest) throw new Error(`CDN verification failed: ${object.name}`);
  report.push({ name: object.name, size: bytes.length, sha256: digest, publicUrl });
  await writeFile(`${directory}/verified.json`, JSON.stringify(report, null, 2));
  console.log(`Verified ${report.length}/${snapshot.objects.length}`);
}

const mapping = new Map(report.map(o => [o.name, o.publicUrl]));
let references = 0;
function replace(value) {
  if (typeof value === 'string' && value.startsWith(source)) {
    const path = value.slice(source.length);
    // Only plain public object references are rewritten; transformations need separate review.
    if (path.includes('?') || path.includes('#')) throw new Error('Unexpected URL parameters');
    const result = mapping.get(decodeURIComponent(path));
    if (!result) throw new Error(`Referenced file not found: ${path}`);
    references++;
    return result;
  }
  if (Array.isArray(value)) return value.map(replace);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, replace(v)]));
  return value;
}
const plan = snapshot.rows.map(row => ({ ...row, updated: replace(row.configuracion) }))
  .filter(row => JSON.stringify(row.updated) !== JSON.stringify(row.configuracion));
await writeFile(`${directory}/plan.json`, JSON.stringify(plan, null, 2));
console.log(JSON.stringify({ verified: report.length, references, changedRows: plan.map(r => ({ source: r.source, id: r.id })) }));
