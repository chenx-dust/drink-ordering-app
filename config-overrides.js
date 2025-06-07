const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function override(config, env) {
  // 修改入口配置
  config.entry = {
    main: path.resolve(__dirname, 'src/index.js'),
    admin: path.resolve(__dirname, 'src/admin/index.js'),
  };

  // 修改输出配置
  config.output = {
    ...config.output,
    filename: 'static/js/[name].[contenthash:8].js',
  };

  // 修改 HtmlWebpackPlugin 配置
  config.plugins = config.plugins.filter(
    (plugin) => !(plugin instanceof HtmlWebpackPlugin)
  );

  // 添加两个 HtmlWebpackPlugin 实例
  config.plugins.push(
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, 'public/admin/index.html'),
      filename: 'admin/index.html',
      chunks: ['admin'],
    })
  );

  return config;
}; 