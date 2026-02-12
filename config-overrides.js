const webpack = require('webpack');
const { execSync } = require('child_process');

let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse --short=8 HEAD').toString().trim();
} catch (e) {
  // git not available — fall back to 'unknown'
}

module.exports = function override(config) {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.REACT_APP_GIT_HASH': JSON.stringify(gitHash),
    })
  );
  // Strip 'node:' prefix so webpack can resolve these as regular modules
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    })
  );
  // Provide empty fallbacks for Node.js builtins used by slp-enforcer's Node.js init path
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    url: false,
    path: false,
  };

  // Ensure .wasm files are handled as assets so webpack resolves URLs
  // correctly in both the main bundle and worker bundles
  const oneOfRule = config.module.rules.find(rule => rule.oneOf);
  if (oneOfRule) {
    oneOfRule.oneOf.unshift({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
  }

  return config;
};
