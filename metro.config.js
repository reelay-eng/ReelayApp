const exclusionList = require('metro-config/src/defaults/exclusionList');
const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.exclusionListRE = exclusionList([/#current-cloud-backend\/.*/]);
defaultConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

module.exports = defaultConfig;
