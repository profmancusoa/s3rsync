import { fileExists } from './file.js';
import { bucketExists } from './s3.js';

const USAGE = '\nUsage: s3fsync sync -cs 1048576 file://bigFile s3://big-bucket';

const paramType = (param) => {
    return param.startsWith('s3://')
      ? "bucket"
      : param.startsWith('file://')
      ? 'file'
      : 'invalid'; 
}

const isParamsValid =  (src, dst, cs) => {
    return (
      paramType(src) != 'invalid' &&
      paramType(dst) != 'invalid' &&
      paramType(src) != paramType(dst) &&
      Number.isInteger(+cs) &&
      paramValue(src) &&
      paramValue(dst)
    );
}

const paramsExists = async (src, dst) => {
    return paramType(src) == 'bucket' 
        ? bucketExists(paramValue(src))
        : ( fileExists(paramValue(src)) && 
            bucketExists(paramValue(dst))
        );
}

export const validateParameters = async (src, dst, size) => {
    console.log("- Validating parameters...");
    if(!isParamsValid(src, dst, size)) {
        console.log("Error in validating parameters");
        console.log(USAGE)
        process.exit(1);
    }
}

export const checkParameters = async (src, dst, size) => {
    console.log("- Checking for file or bucket...");
    if(! await paramsExists(src, dst)) {
        console.log("Error either file or bucket not found");
        console.log(USAGE)
        process.exit(1);
    }
}

export const syncType = (src) => {
    return paramType(src) == 'file' ? 'syncTo' : 'syncFrom';
}

export const paramValue = (param) => {
    return paramType(param) == 'bucket' 
      ? param.slice(5) 
      : param.slice(7); 
}