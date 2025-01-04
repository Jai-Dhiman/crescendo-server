import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";

const BUCKET_NAME = process.env.S3_BUCKET!;
const CDN_DOMAIN = process.env.CLOUDFRONT_URL!;

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadToS3(file: File) {
  try {
    const fileExtension = file.name.split(".").pop();
    const s3Key = `pieces/${createId()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
    });

    console.log("Attempting upload with params:", {
      bucket: BUCKET_NAME,
      key: s3Key,
      contentType: file.type,
      bodySize: buffer.length,
    });

    const response = await s3.send(command);
    console.log("Upload response:", response);

    const cdnUrl = `https://${CDN_DOMAIN}/${s3Key}`;
    return { s3Key, cdnUrl };
  } catch (error: any) {
    console.error("Detailed upload error:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
}

export async function deleteFromS3(s3Key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  await s3.send(command);
}
