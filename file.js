import fs from 'fs';
import splitFile from 'split-file';
import md5File from 'md5-file';
import { log, spinner, yellow } from './helper.js';

const dumpManifest = (fPath, manifest) => {
    try {
        fs.writeFileSync(fPath, JSON.stringify(manifest, null, 2));
        return JSON.stringify(manifest, null, 2);
    } catch(e) {
        log('red', 'ERROR: Cannot write chunk manifest...');
        return null;
    }
}

const buildChunkManifest = async (chunkList) => {
    let progress = spinner(yellow('Building chunk manifest file...   '));
    
    try {
        progress.start();
        let chunkManifest = [];
        let destDir = chunkList[0].split('/')[0];

        //build manifest
        chunkList.forEach(chunk => {
            chunkManifest.push({
                chunk: chunk, 
                hash: md5File.sync(chunk)
            });
        });
        
        //dump manifest
        let manifestFile = dumpManifest(`${destDir}/manifest.json`, chunkManifest); 
        progress.stop();

        return manifestFile;
    } catch(e) {
        log('red', 'ERROR: Cannot generate chunk manifest...');
        return null;
    }
}

export const file2chunkDir = (file) => {
    return `${file}_chunks`;
}

export const file2Manifest = (file) => {
    return `${file2chunkDir(file)}/manifest.json`;
}

export const fileExists = (file) => {
    return fs.existsSync(file);
}

export const chunkFile = async (file, cs) => {
    //calculate right chunkSize (min 4K)
    let fSize = fs.statSync(file).size;
    let chunkSize = Math.max(Math.min(cs, fSize), 4096);
    let chunkDir = file2chunkDir(file);
    let progress = spinner(yellow('Chunking file...   '));

    try {
        //create chinks dir and chink file
        log('yellow', `\n\n- Chunking file into ${chunkSize} byte chunks...\n\n`);
        progress.start();
        
        if(!fileExists(chunkDir))
            fs.mkdirSync(chunkDir);
        let chunkList = await splitFile.splitFileBySize(file, chunkSize, chunkDir);
        
        //build chink Manifest file
        // return await buildChunkManifest(chunkList);
        let manifestFile = await buildChunkManifest(chunkList);

        progress.stop();
        return manifestFile;
    } catch(e) {
        log('red', 'ERROR: Cannot chunk file...');
        process.exit(1);
    }
}

export const mergeChunks = async (chunk_list, filename) => {
    await splitFile.mergeFiles(chunk_list, filename);
};

export const delChunks = (file) => {
    try {
        fs.rmSync(file2chunkDir(file), {recursive: true});
    } catch(e) {
        log('red', 'WARNING: Cannot remove chunks dir...');
    }
}

export const readFile = (file) => {
    return fs.readFileSync(file);
}

export const writeFile = (file, bytes) => {
    return fs.writeFileSync(file, bytes);
};

export const makeDir = (dir) => {
    return fs.mkdirSync(dir, { recursive: true });
}