import fs from 'fs';
import splitFile from 'split-file';
import md5File from 'md5-file';

const dumpManifest = (fPath, manifest) => {
    try {
        fs.writeFileSync(fPath, JSON.stringify(manifest, null, 2));
        return JSON.stringify(manifest, null, 2);
    } catch(e) {
        console.log('ERROR: Cannot write chunk manifest...');
        return null;
    }
}

const buildChunkManifest = async (chunkList) => {
    console.log('- Building chunk manifest file...');
    try {
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
        return dumpManifest(`${destDir}/manifest.json`, chunkManifest);
    } catch(e) {
        console.log('ERROR: Cannot generate chunk manifest...');
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

    try {
        //create chinks dir and chink file
        console.log(`- Chunking file into ${chunkSize} byte chunks...`);
        if(!fileExists(chunkDir))
            fs.mkdirSync(chunkDir);
        let chunkList = await splitFile.splitFileBySize(file, chunkSize, chunkDir);
        
        //build chink Manifest file
        return await buildChunkManifest(chunkList);

        // return chunkList;
    } catch(e) {
        console.log('ERROR: Cannot chunk file...');
        process.exit(1);
    }
}

export const delChunks = (file) => {
    try {
        fs.rmSync(file2chunkDir(file), {recursive: true});
    } catch(e) {
        console.log('WARNING: Cannot remove chunks dir...');
    }
}

export const readFile = (file) => {
    return fs.readFileSync(file);
}