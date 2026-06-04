import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.integration.test.ts'],
      passWithNoTests: true,
      coverage: {
        thresholds: {
          lines: 0,
          statements: 0,
          functions: 0,
          branches: 0,
        },
      },
    },
  }),
);
