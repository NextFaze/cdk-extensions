module.exports = {
  testEnvironment: 'node',
  verbose: true,
  reporters: ['default', './jest-reporter'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/*.test.js', '**/*.spec.js'],
};
