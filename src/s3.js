import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_KEY } from "./config";

import fs from 'fs';

const client = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
});

export async function uploadFile(file) {
    const stream = fs.createReadStream(file.tempFilePath);
    const cmd = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: file.name,
        Body: stream
    });
    const result = await client.send(cmd);
    return result;
}

export async function getFiles() {
    const cmd = new ListObjectsCommand({
        Bucket: AWS_BUCKET_NAME
    })
    const result = await client.send(cmd);
    return result;
}

export async function getFile(filename) {
    try {
        const cmd = new GetObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: filename
        });

        const result = await client.send(cmd);
        return result;
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            return null;
        }
        throw error;
    }
}

export async function downloadFile(filename) {
    const cmd = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename,
    });

    const response = await client.send(command);

    if (!response.Body) {
        throw new Error("Failed to get file stream");
    }

    return response.Body;
}

export async function deleteFile(filename) {
    const cmd = new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    });

    try {
        const response = await client.send(cmd);
        return response;
    } catch (e) {
        if (error.name === 'NoSuchKey') {
            return null;
        }
        throw error;
    }
}