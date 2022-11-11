const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, 'src/content-script.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'content-script.js',
    clean: true,
  },

  optimization: {
    minimize: true,
    minimizer: [
      new JsonMinimizerPlugin(),
    ],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/icons'), to: 'icons' },
        { from: path.resolve(__dirname, 'src/manifest.json')},
      ],
    }),
  ],

  resolve: {
    extensions: [
      '.ts', '.js',
    ],
  },
};