const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // react-native-mapsをWeb環境で無視する
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': false,
  };
  
  return config;
};