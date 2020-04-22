const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjector = require('html-webpack-injector');

module.exports = {
  entry: {
      index_head: './src/index.ts',
      dom: './src/dom.ts'
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
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: function () { // post css plugins, can be exported to postcss.config.js
              return [
                require('precss'),
                require('autoprefixer')
              ];
            }
          }
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: true,
      filename: 'index.html',
      chunks: ['index_head', 'dom']
    }),
		new HtmlWebpackInjector(),
		new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'about.html'),
      inject: true,
      filename: 'about.html',
      chunks: ['index_head']
    }),
		new HtmlWebpackInjector(),
		new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'faq.html'),
      inject: true,
      filename: 'faq.html',
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