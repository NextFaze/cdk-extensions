/* eslint-disable @typescript-eslint/no-var-requires */
const { compilerOptions } = require('./tsconfig.json');
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
module.exports.mapper = function () {
  const paths = compilerOptions.paths;

  return Object.keys(paths).reduce((acc, key) => {
    const jcPathKey = key.replace(/\*/, '(.*)');
    const pathValue = paths[key];

    const jcPathValues = pathValue.map((path) => {
      return `<rootDir>/${path}`.replace(/\*/, '$1');
    });

    acc[jcPathKey] = jcPathValues;
    return acc;
  }, {});
};
