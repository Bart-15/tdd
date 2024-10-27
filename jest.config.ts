import type { Config } from '@jest/types';

const baseDir = '<rootDir>/src/app/handlers';
const baseTestDir = '<rootDir>/src/test/handlers';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [`${baseDir}/**/*.ts`],
  testMatch: [`${baseTestDir}/**/*.ts`],
};
export default config;
