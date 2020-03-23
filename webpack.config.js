const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjector = require('html-webpack-injector');

module.exports = {
  entry: {
      index_head: './src/index.ts'
  },
  // delevelopment config
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    port: 8080
  },
  // end dev config
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: true,
      filename: 'index.html',
      chunks: ['index_head']
    }),
    new HtmlWebpackInjector()
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
};