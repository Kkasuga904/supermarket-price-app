const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable experimental features for React 19 support
config.resolver.unstable_enablePackageExports = true;

// Platform-specific resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// カスタムリゾルバーでreact-native-mapsをWeb環境で除外
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Web環境でreact-native-mapsをブロック
  if (platform === 'web' && moduleName.includes('react-native-maps')) {
    return {
      type: 'empty',
    };
  }
  
  // その他の場合はデフォルトのリゾルバーを使用
  return originalResolveRequest 
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;