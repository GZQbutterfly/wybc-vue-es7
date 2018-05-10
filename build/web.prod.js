const webpack = require('webpack');

let web = require('../config/web.conf');



web.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }));

module.exports = web;