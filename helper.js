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
        mergedLocalManifest: inLocalManifest.filter(chunk => !hasSameHash(chunk, inS3Manifest)),
        mergedS3Manifest: inS3Manifest.filter(chunk => indexOfChunk(chunk, inLocalManifest) == -1)
    }
}