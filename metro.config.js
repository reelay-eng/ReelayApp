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

  defaultConfig.server.rewriteRequestUrl= (url) => {
      if (!url.endsWith('.bundle')) {
        return url;
      }
      // https://github.com/facebook/react-native/issues/36794
      // JavaScriptCore strips query strings, so try to re-add them with a best guess.
      return url + '?platform=ios&dev=true&minify=false&modulesOnly=false&runModule=true';
    } // ...
  
defaultConfig.resolver.sourceExts.push('cjs');
module.exports = defaultConfig;
