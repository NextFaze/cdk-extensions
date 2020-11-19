const packageJson = require('../package.json');

module.exports.syncPeerDeps = () => {
  // sync peer deps
  syncAwsCdkDep();
};

function syncAwsCdkDep() {
  const awsCdkDep =
    packageJson.dependencies['aws-cdk'] ||
    packageJson.devDependencies['aws-cdk'];

  if (!awsCdkDep) {
    throw new Error(
      `Failed to replace "AWS_CDK_PEER_VERSION" with aws cdk version, because no matching aws-cdk versions could be found`
    );
  }

  console.log(`AWS_CDK_PEER_VERSION ${awsCdkDep}`);
}
