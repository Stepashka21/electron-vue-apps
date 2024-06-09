const { defineConfig } = require('@vue/cli-service')
module.exports = {
  pluginOptions: {
    electronBuilder: {
      // Prevent Electron from launching with an external server URL in dev mode
      nodeIntegration: true,
      customFileProtocol: 'app://./',
    },
  },
  configureWebpack: {
    // Avoid warnings when running in development mode
    devtool: 'source-map',
    target: 'electron-renderer'
  },
}