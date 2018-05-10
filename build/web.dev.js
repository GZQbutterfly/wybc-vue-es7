const webpack = require('webpack');

let web = require('../config/web.conf');

// web.watch = true;

web.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }));

module.exports = web;