const webpack = require('webpack');

module.exports = function override(config) {
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
  return config;
};
