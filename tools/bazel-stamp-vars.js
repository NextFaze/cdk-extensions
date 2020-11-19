const { inferPackageVersion } = require('./infer-package-version');
const { syncPeerDeps } = require('./sync-peer-deps');

const argsWithoutNode = process.argv.slice(1);
process.on('uncaughtException', function () {
  console.error('Failed to execute:', argsWithoutNode.join(' '));
});

// infer package version from current git tag
inferPackageVersion();

// sync peer deps
syncPeerDeps();
