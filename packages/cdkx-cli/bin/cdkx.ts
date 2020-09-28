#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { Command } from 'commander';

const program = new Command();

// banner
console.log(
  chalk.redBright(
    figlet.textSync('Cdkx-cli', {
      horizontalLayout: 'full',
    })
  )
);

program
  .description('cdkx cli')
  .command('add <package name>')
  .description('Installs and updates relevant package.json with new entry')
  .action((packageName: string) => {
    console.log(`Adding Package ${packageName}`);
  });

program.parse(process.argv);
