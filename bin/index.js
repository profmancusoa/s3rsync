#! /usr/bin/env node
// https://www.npmjs.com/package/clui
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
// https://medium.com/@manavshrivastava/lets-build-a-cli-command-line-interface-with-node-js-d3b5faacc5ea

import { main } from "../main.js";

import pkg from 'clui';
const { Progress, Spinner } = pkg;
import chalk from 'chalk';


(async function () {

    // let perc = 0;

    // let thisProgressBar = new Progress(100);
    // setInterval(() => {
    //     console.log(thisProgressBar.update(perc++ / 100));
    // }, 100);

    // var countdown = new Spinner(chalk.green('Uploading Chunks...  '), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
//     var countdown = new Spinner(chalk.green('Uploading Chunks...  '), [chalk.red('⣾'),chalk.red('⣽'),chalk.red('⣻'),chalk.red('⢿'),chalk.red('⡿'),chalk.red('⣟'),chalk.red('⣯'),chalk.red('⣷')]);
  

//     countdown.start();
//     var number = 3;
//     setInterval(function () {
//       number--;
//       countdown.message(chalk.green('Uploading Chunks...  '));
//       if (number === 0) {
//         process.stdout.write('\n');
//         process.exit(0);
//       }
//     }, 1000);


// console.log(chalk.yellow.bgBlue.bold('Hello world!'));

// console.log(`
// CPU: ${chalk.red('90%')}
// RAM: ${chalk.green('40%')}
// DISK: ${chalk.yellow('70%')}
// `);

// console.log(chalk.rgb(123, 45, 67).underline('Underlined reddish color'));
// console.log(chalk.hex('#DEADED').bold('Bold gray!'));


    await main();
})();
