import { VERSION, MIN_CHUNK_SIZE } from './.env';
import {
  checkParameters,
  validateParameters,
  syncType,
  paramValue,
} from "./params.js";
import {
  chunkFile,
  delChunks,
  file2Manifest,
  fileExists,
  makeDir,
  mergeChunks,
  file2chunkDir,
} from "./file.js";
import {
  hasSameHash,
  mergeManifests,
  yellow,
  log,
  spinner,
  getS3WriteLocalChunk,
  writeManifestChunks,
  deleteManifestChunks,
} from "./helper.js";
import { getManifest, writeObject } from './s3.js';
import boxen from 'boxen';

const s3rsyncTo = async (file, bucket, size) => {
    let progress = spinner(yellow('Synching chunks to S3...   '));
    let totalChunks = 0;
    let uploadedChunks = 0;
    let chunkSize = size < MIN_CHUNK_SIZE ? MIN_CHUNK_SIZE : size;

    try {
        log('yellow', `\n- Start synching file://${file} to s3://${bucket}...`);
        progress.start();

        //chunk file and generate Manifest file
        let localManifest = JSON.parse(await chunkFile(file, size, true));
        totalChunks = localManifest.chunks.length;

        //get chunk manifest from bucket        
        let s3Manifest = await getManifest(bucket, file);
        
        if(s3Manifest == null) {
            await writeManifestChunks(bucket, localManifest.chunks);
            await writeObject(bucket, file2Manifest(file))
            uploadedChunks = localManifest.chunks.length;
        } else {
            let {mergedLocalManifest, mergedS3Manifest} = mergeManifests(localManifest, s3Manifest)
            await writeManifestChunks(bucket, mergedLocalManifest);
            await deleteManifestChunks(bucket, mergedS3Manifest);
            await writeObject(bucket, file2Manifest(file));
            uploadedChunks = mergedLocalManifest.length;
        }
        progress.stop();
        log('yellow', `\nSuccessfully synched file://${file} to s3://${bucket}\n\n`);
        log('yellow', `Uploaded ${uploadedChunks}/${totalChunks} chunks - Saved ${(totalChunks - uploadedChunks) * chunkSize} bytes\n\n`);
    } catch(e) {
        log('red', `ERROR: Cannot sync file://${file} to s3://${bucket}`);
    } finally {
        //cleanup
        delChunks(file);
    }
}

const s3rsyncFrom = async (bucket, file, size) => {
    let progress = spinner(yellow('Synching chunks from S3...   '));
    let totalChunks = 0;
    let uploadedChunks = 0;

    try {
        log('yellow', `\n- Start synching s3://${bucket} to file://${file}...\n\n`);
        //always create chunks dir 
        makeDir(file2chunkDir(file));

        //get chunk manifest from bucket        
        let s3Manifest = await getManifest(bucket, file);  
        let chunkSize = s3Manifest.chunkSize;
        totalChunks = s3Manifest.chunks.length;
        progress.start();

        if(!fileExists(file)) {
            for (const chunk of s3Manifest.chunks) {
                await getS3WriteLocalChunk(bucket, chunk.chunk);
            }
            uploadedChunks = s3Manifest.chunks.length;
        } else {
            //chunk file and generate Manifest file
            let localManifest = JSON.parse(await chunkFile(file, chunkSize, false));
            for (const chunk of s3Manifest.chunks) {
                if(!hasSameHash(chunk, localManifest.chunks)){
                    await getS3WriteLocalChunk(bucket, chunk.chunk);
                    uploadedChunks++;
                }
            }
        }
        await mergeChunks(s3Manifest.chunks.map(chunk => chunk.chunk), file);
        progress.stop();
        log('yellow', `\nSuccessfully synched s3://${bucket} to file://${file}\n\n`);
        log('yellow', `Downloaded ${uploadedChunks}/${totalChunks} chunks - Saved ${(totalChunks - uploadedChunks) * chunkSize} bytes\n\n`);
    } catch (e) {
        log('red', `ERROR: Cannot sync s3://${bucket}/${file} to file://${file}`);
    }finally {
        delChunks(file);
    }
}

const s3rsyncType = async (syncType, src, dst, size) => {
    await syncType == 'syncTo' 
        ? s3rsyncTo(paramValue(src), paramValue(dst), size) 
        : s3rsyncFrom(paramValue(src), paramValue(dst), size); 
} 

export const s3rsync = async (src, dst, size) => {
    if(!size)
        size = MIN_CHUNK_SIZE;
    try {
        log('yellow',
            boxen(yellow(VERSION), {
                margin: 1,
                padding: 2,
                borderColor: "yellowBright",
                dimBorder: false,
                borderStyle: "round",
            })
            );

        //validate params
        validateParameters(src, dst, size);
        
        //check if param value exists
        await checkParameters(src, dst, size);
        
        //sync file and bucket
        await s3rsyncType(syncType(src), src, dst, size);
    } catch(e) {
        console.log(e);
    }
}
