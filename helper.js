import chalk from 'chalk';
import pkg from 'clui';
const { Spinner } = pkg;
import { getChunk, writeObject, deleteObject } from "./s3.js";
import { writeFile } from './file.js';

export const yellow = (str) => {
    return chalk.yellowBright(str);
}

export const log = (color, str) => { 
    process.stdout.write(chalk[color + 'Bright'](str));
}

export const spinner = (str) => {
    let spin = new Spinner(chalk.green(str), [
      chalk.yellow("▁"),
      chalk.yellow("▂"),
      chalk.yellow("▃"),
      chalk.yellow("▄"),
      chalk.yellow("▅"),
      chalk.yellow("▆"),
      chalk.yellow("▇"),
      chalk.yellow("█"),
    ]);
    
    return spin; 
}

export const indexOfChunk = (chunk, target) => {
   return target.findIndex(item => item.chunk === chunk.chunk);
}

export const hasSameHash = (chunk, target) => {
    //check if chunk is present in target and have same hash
    let idx = indexOfChunk(chunk, target);
    if(idx != -1)
        return chunk.hash == target[idx].hash;       
    return false;
}

export const mergeManifests = (inLocalManifest, inS3Manifest) => {
    //calculate final manifest for SyncTo
    // mergedLocalManifest chunks need to be uploaded
    // mergedS3Manifest chunks need to be removed
    return {
        mergedLocalManifest: inLocalManifest.chunks.filter(chunk => !hasSameHash(chunk, inS3Manifest.chunks)),
        mergedS3Manifest: inS3Manifest.chunks.filter(chunk => indexOfChunk(chunk, inLocalManifest.chunks) == -1)
    }
}

export const getS3WriteLocalChunk = async (bucket, chunk) => {
    const chunk_bytes = await getChunk(bucket, chunk);
    writeFile(chunk, chunk_bytes);
}

export const writeManifestChunks = async (bucket, manifest) => {
    manifest.forEach(async chunk => {
        await writeObject(bucket, chunk.chunk);
    });
}

export const deleteManifestChunks = async (bucket, manifest) => {
    manifest.forEach(async chunk => {
        await deleteObject(bucket, chunk.chunk);
    });
}
            