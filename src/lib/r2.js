import 'server-only';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function createPhotoUpload({ eventoId, contentType, size, extension }) {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  if (![R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL].every(Boolean)) {
    throw new Error('R2 configuration missing');
  }
  const client = new S3Client({
    region: 'auto', endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    requestChecksumCalculation: 'WHEN_REQUIRED',
  });
  const key = `${eventoId}/${randomUUID()}.${extension}`;
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
    Bucket: R2_BUCKET, Key: key, ContentType: contentType, ContentLength: size,
  }), { expiresIn: 120, signableHeaders: new Set(['content-type', 'content-length']) });
  return { uploadUrl, publicUrl: `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}` };
}
