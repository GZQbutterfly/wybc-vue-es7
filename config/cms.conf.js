// webpack开发环境配置
let webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    baseConfig = require('./base.config');

let CleanWebpackPlugin = require('clean-webpack-plugin');

let CopyWebpackPlugin = require('copy-webpack-plugin');

let srcRoot = '../src';

let distCmsRoot = '../dist/cms';

let nodeModulesRoot = '../node_modules';


baseConfig.output = {
    path: path.join(__dirname, distCmsRoot),
    filename: '[name].js',
    chunkFilename: '[name].js?[hash:20]',
    publicPath: '../cms/'
}


baseConfig.entry = {
    'cms.vue_mode': ['vue', 'vue-property-decorator', 'vue-class-component'],
    'cms.lodash': ['lodash'],
    'cms.common.env': [
        path.join(__dirname, srcRoot, '/commons/env/base_vue/base.vue.js'),
        path.join(__dirname, srcRoot, '/commons/env/common.env.js')
    ],
    'cms.swiper': [path.join(__dirname, srcRoot, '/commons/assets/swiper/swiper.js')],
    'cms.main': path.join(__dirname, srcRoot, '/page/cms/index.js'),
};

// 插件
baseConfig.plugins.push(
    new HtmlWebpackPlugin({
        filename: path.join(__dirname, distCmsRoot, 'index.html'),
        template: path.join(__dirname, srcRoot, '/page/cms/index.tpl.html'),
        minify: {
            removeComments: true
        },
        cache: true,
        hash: true,
        favicon: path.join(__dirname, srcRoot, '/page/favicon.ico'),
        inject: 'body',
        chunks: ['cms.lodash', 'cms.vue_mode', 'cms.common.env', 'cms.swiper', 'cms.main']
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: [
            'cms.lodash',
            'cms.vue_mode',
            'cms.common.env',
            'cms.swiper'
        ],
        minChunks: Infinity
    }),
    new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
    }),
    new webpack.optimize.UglifyJsPlugin()
);

module.exports = baseConfig;
