import { fileExists } from './file.js';
import { bucketExists } from './s3.js';
import { yellow, log } from './helper.js';
import boxen from 'boxen';

// const USAGE = '\nUsage: s3fsync sync -cs 1048576 file://bigFile s3://big-bucket';
const USAGE_STR = `
s3fsync sync -cs 1048576 file://bigFile s3://big-bucket
\ns3fsync sync -cs 1048576 s3://big-bucket file://bigFile 
\nfile and bucket must exists`;

const USAGE = boxen(USAGE_STR, {
                  margin: 1,
                  padding: 1,
                  borderColor: "yellowBright",
                  dimBorder: false,
                  borderStyle: "round",
                  title: 'Usage',
                  titleAlignment: 'center'
                });

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

const showUsage = () => {
    log('red', '...ERROR');
    log('cyan', `\n\n${USAGE}\n`)
    process.exit(1);
}

export const validateParameters = async (src, dst, size) => {
    log('yellow', '\n- Validating parameters...');
    if(!isParamsValid(src, dst, size))
        showUsage();
    log('green', '...OK\n');
}

export const checkParameters = async (src, dst, size) => {
    log('yellow', '\n- Checking for file or bucket presence...');
    if(! await paramsExists(src, dst))
        showUsage();
    log('green', '...OK\n');
}

export const syncType = (src) => {
    return paramType(src) == 'file' ? 'syncTo' : 'syncFrom';
}

export const paramValue = (param) => {
    return paramType(param) == 'bucket' 
      ? param.slice(5) 
      : param.slice(7); 
}