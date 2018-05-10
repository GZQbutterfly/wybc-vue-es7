
const webpack = require('webpack');

let cms = require('../config/cms.conf');

// cms.watch = true;

cms.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }));

module.exports = cms;