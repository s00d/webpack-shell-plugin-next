import path from 'path';
import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  verbose: true,
  rootDir: path.resolve(__dirname, './'),
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx', 'js'],
  preset: '<rootDir>/node_modules/ts-jest',
};

export default config;
