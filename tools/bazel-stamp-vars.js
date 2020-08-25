#!/usr/bin/env node

import { execSync } from 'child_process';

const argsWithoutNode = process.argv.slice(1);
process.on('uncaughtException', function () {
  console.error('Failed to execute:', argsWithoutNode.join(' '));
});

const BUILD_SCM_HASH = _exec(`git rev-parse HEAD`);
console.log(`BUILD_SCM_HASH ${BUILD_SCM_HASH}`);
console.log(`BUILD_SCM_VERSION 0.1.0`);

const currentTag = _exec(`git tag`);
if (!currentTag) {
  console.error(`No git tags found, can't stamp the build.`);
  console.error('Please fetch the tags first:');
  console.error(
    '       git fetch git@github.com:NextFaze/cdk-extensions.git --tags'
  );
} else {
  const BUILD_SCM_VERSION_RAW = _exec(
    `git describe --match v[0-9].[0-9].[0-9]* --abbrev=7 --tags HEAD`
  );

  const BUILD_SCM_VERSION = BUILD_SCM_VERSION_RAW.replace(
    /-([0-9]+)-g/,
    '+$1.sha-'
  );

  console.log(`BUILD_SCM_VERSION ${BUILD_SCM_VERSION}`);
}

function _exec(command) {
  return execSync(command).toString().trim();
}
