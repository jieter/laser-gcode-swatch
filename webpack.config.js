var webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: './browser.js',
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
      loaders: [
          { test: /\.js$/, loader: 'babel-loader', query: { presets: ['es2015'] } },
      ]
  },
  plugins: [
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
