var webpack = require('webpack');
var minimize = process.argv.indexOf('--minimize') !== -1;

module.exports = {
    /** Build from built js file */
    entry: {
      layouts: './lib/index.js',
    },
    output: {
        filename: minimize?'./umd/layouts.min.js':'./umd/layouts.js',
        libraryTarget: 'umd',
        /** The library name on window */
        library: 'layouts'
    },
    plugins:minimize?[new webpack.optimize.UglifyJsPlugin({ minimize: true })]:[]
};