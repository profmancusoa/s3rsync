import { VERSION } from './.env';
import { checkParameters, validateParameters, syncType, paramValue } from './params.js';
import { chunkFile, delChunks, file2Manifest, fileExists, makeDir, mergeChunks, writeFile } from './file.js';
import { getManifest, writeObject, deleteObject, getChunk } from './s3.js';
import { hasSameHash, mergeManifests, yellow, log, spinner } from './helper.js';
import boxen from 'boxen';

const s3fsyncTo = async (file, bucket, size) => {
    let progress = spinner(yellow('Synching chunks to S3...   '));
    try {
        log('yellow', `\n- Start synching file://${file} to s3://${bucket}...`);
        progress.start();

        //chunk file and generate Manifest file
        let localManifest = JSON.parse(await chunkFile(file, size));
        //get chunk manifest from bucket        
        let s3Manifest = await getManifest(bucket, file);
    
        if(s3Manifest == null) {
            localManifest.forEach(async chunk => {
                await writeObject(bucket, chunk.chunk);
            })
            await writeObject(bucket, file2Manifest(file))
        } else {
            let localManifestSize = localManifest.length;
            let s3ManifestSize = s3Manifest.length;
            let {mergedLocalManifest, mergedS3Manifest} = mergeManifests(localManifest, s3Manifest)
            
            mergedLocalManifest.forEach(async chunk => {
                await writeObject(bucket, chunk.chunk);
            });

            mergedS3Manifest.forEach(async chunk => {
                await deleteObject(bucket, chunk.chunk);
            });
            await writeObject(bucket, file2Manifest(file));
        }
        progress.stop();
        log('yellow', `\nSuccessfully synched file://${file} to s3://${bucket}\n\n`);
    } catch(e) {
        log('red', `ERROR: Cannot sync file://${file} to s3://${bucket}`);
    } finally {
        //cleanup
        delChunks(file);
    }
}

const s3fsyncFrom = async (bucket, file, size) => {
    console.log("s3fsyncFrom:", bucket, file);
    try {
        const local_temp_path = file.concat("_chunks")
        if(!fileExists(local_temp_path))
            makeDir(local_temp_path);
        if(!fileExists(file)) {
            console.log("DOWNLOAD DIRETTO DI TUTTO");
            const manifest = await getManifest(bucket, file);
            for (const chunk of manifest) {
                const chunk_bytes = await getChunk(bucket, chunk.chunk);
                writeFile(chunk.chunk, chunk_bytes);
            }
            await mergeChunks(manifest.map(chunk => chunk.chunk), file);
        } else {
            console.log("DOWNLOAD SOLO DEI CHUNCK DIFF");
            const local_manifest = JSON.parse(await chunkFile(file, size));
            const bucket_manifest = await getManifest(bucket, file);
            for (const chunk of bucket_manifest) {
                if(!hasSameHash(chunk, local_manifest)){
                    const chunk_bytes = await getChunk(bucket, chunk.chunk);
                    writeFile(chunk.chunk, chunk_bytes);
                }
            }
            await mergeChunks(bucket_manifest.map(chunk => chunk.chunk), file);
        }
    } catch (e) {
        console.log(e)
        console.log(`ERROR: Cannot sync s3://${bucket}/${file} to file://${file}`);
    }finally {
        delChunks(file);
    }
}

const s3fsyncType = async (syncType, src, dst, size) => {
    await syncType == 'syncTo' 
        ? s3fsyncTo(paramValue(src), paramValue(dst), size) 
        : s3fsyncFrom(paramValue(src), paramValue(dst), size); 
} 

export const s3fsync = async (src, dst, size) => {
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
        await s3fsyncType(syncType(src), src, dst, size);
    } catch(e) {
        console.log(e);
    }
}
