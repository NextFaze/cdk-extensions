module.exports = {
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
  reporters: ['default', './jest-reporter'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts'],
};
