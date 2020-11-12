/* eslint-disable @typescript-eslint/no-var-requires */
const { mapper } = require('./jest-tsconfig-paths-mapper');

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest',
  reporters: ['default', './jest-reporter'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts'],
  modulePathIgnorePatterns: ['cdk.out', 'bin'],
  moduleNameMapper: mapper(),
};
