module.exports = {
  testEnvironment: 'node',
  reporters: ['default', './jest-reporter'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/*.spec.ts'],
};
