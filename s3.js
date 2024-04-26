import { S3Client, HeadBucketCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"; 
import { file2chunkDir, readFile } from "./file.js";
import { log } from './helper.js';

const client = new S3Client();

export const bucketExists = async bucket => {
    try {
        const command = new HeadBucketCommand({ Bucket: bucket });
        const response = await client.send(command);
        
        return true;
    } catch(e) {
        return false;
    }
}

const readObject = async (bucket, file) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: file
        });
        const response = await client.send(command);
        return response.Body;
    } catch(e) {
        return null;
    }
}

export const writeObject = async (bucket, file) => {
    console.log("WRITE:", bucket, file)
    let data = readFile(file);
    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: file,
            Body: data
        });
        const response = await client.send(command);
    } catch(e) {
        console.log("ERROR: Cannot write an object to S3");
        process.exit(1);
    }
}

export const deleteObject = async (bucket, file) => {
    console.log("DELETE:", bucket, file)
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: file
        });
        const response = await client.send(command);
    } catch(e) {
        console.log("ERROR: Cannot delete an object from S3");
        process.exit(1);
    }
}

export const getManifest = async (bucket, file) => {
    log('yellow', '- Getting manifest file from S3\n');
    try {
        let manifestFile = `${file2chunkDir(file)}/manifest.json`;
        let manifestRaw = await readObject(bucket, manifestFile);
        let manifest = JSON.parse(await manifestRaw.transformToString());
        return manifest;
    } catch(e) {
        return null;
    }
}