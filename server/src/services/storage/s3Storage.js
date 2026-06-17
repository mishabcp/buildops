import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getClient() {
  const endpoint = process.env.S3_ENDPOINT || undefined;
  const region = process.env.S3_REGION || 'auto';
  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: Boolean(endpoint),
  });
}

function getBucket() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET is not configured');
  return bucket;
}

export async function putObject(storageKey, buffer, mimeType) {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    })
  );
}

export async function getObjectStream(storageKey) {
  const client = getClient();
  const res = await client.send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: storageKey,
    })
  );
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);
  return {
    body,
    contentLength: body.length,
    contentType: res.ContentType,
  };
}

export async function deleteObject(storageKey) {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: storageKey,
    })
  );
}

export async function getSignedDownloadUrl(storageKey, expiresIn = 300) {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: storageKey,
  });
  return getSignedUrl(client, command, { expiresIn });
}
