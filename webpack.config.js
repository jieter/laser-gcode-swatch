var webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './browser.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: { presets: ['es2015'] }
            },
        ],
        rules: [{
            test: require.resolve('jquery'),
            use: [
                { loader: 'expose-loader', options: '$'},
                { loader: 'expose-loader', options: 'jQuery'},
            ]
        }]
    },
    plugins: [
        // new webpack.optimize.DedupePlugin(),
        // new webpack.optimize.OccurenceOrderPlugin(),
        new UglifyJSPlugin({
            mangle: false,
            sourcemap: false,
            compressor: {
                warnings: false
            }
        }),
    ],
};
