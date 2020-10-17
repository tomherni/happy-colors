import merge from 'deepmerge';
import { createSpaConfig } from '@open-wc/building-rollup';

const baseConfig = createSpaConfig({
  outputDir: 'dist',
  legacyBuild: true,
  developmentMode: process.env.ROLLUP_WATCH === 'true',
  injectServiceWorker: false,
});

export default merge(baseConfig, {
  input: './index.html',
});
