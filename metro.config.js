const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable bundling of TFLite / LiteRT model assets
config.resolver.assetExts.push('tflite');

module.exports = config;
