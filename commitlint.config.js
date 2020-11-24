const { readdirSync } = require('fs');

const packages = () =>
  readdirSync('./packages', { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

console.log(`Valid Package scopes:`, packages());

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', packages()],
    'scope-case': [2, 'always', 'kebab-case'],
  },
};
