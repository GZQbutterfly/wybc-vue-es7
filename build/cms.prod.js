const webpack = require('webpack');

let cms = require('../config/cms.conf');


cms.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }));

module.exports = cms;