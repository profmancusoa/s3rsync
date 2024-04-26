import { program } from 'commander';
import { s3fsync } from './s3fsync.js';
import { VERSION } from './.env';

export const main = async () => {
    //cli parameters
    program
        .version(VERSION, '-v, --version', 'output the current version')
        .command('sync <source> <destination>')
        .description('smart sync of file:// | s3:// source to file:// | s3:// destination')
        .requiredOption('-cs, --chunk-size <bytes>', 'chunk size in bytes')
        .action((source, destination, options) => {
            s3fsync(source, destination, options.chunkSize);
        })
        .showHelpAfterError();

    program.parse(process.argv);
}