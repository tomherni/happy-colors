/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('webpack-merge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        { pattern: config.grep || 'src/**/test/*.test.js', type: 'module' },
      ],
      esm: {
        nodeResolve: true,
      },
    })
  );
  return config;
};
