const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");

module.exports = {
  entry: {
    "content-script": path.resolve(__dirname, "src/content/content-script.ts"),
    "popup/popup": path.resolve(__dirname, "src/popup/popup.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },

  optimization: {
    minimize: true,
    minimizer: [new JsonMinimizerPlugin()],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|sass|css)$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                auto: /content/,
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/popup/popup.html"),
      filename: "popup/popup.html",
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "src/icons"), to: "icons" },
        { from: path.resolve(__dirname, "src/manifest.json") },
      ],
    }),
  ],

  resolve: {
    extensions: [".ts", ".js"],
  },
};
