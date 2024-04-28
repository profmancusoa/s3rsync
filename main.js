import { program } from 'commander';
import { s3rsync } from './s3rsync.js';
import { VERSION } from './.env';

export const main = async () => {
    //cli parameters
    program
        .version(VERSION, '-v, --version', 'output the current version')
        .command('sync <source> <destination>')
        .description('smart sync of file:// | s3:// source to file:// | s3:// destination')
        .option('-cs, --chunk-size <bytes> (default 4096)', 'chunk size in bytes')
        .action((source, destination, options) => {
            s3rsync(source, destination, options.chunkSize);
        })
        .showHelpAfterError();

    program.parse(process.argv);
}