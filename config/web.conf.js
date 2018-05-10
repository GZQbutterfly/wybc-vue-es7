// webpack生产环境配置
let webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    baseConfig = require('./base.config');


let CleanWebpackPlugin = require('clean-webpack-plugin');

let CopyWebpackPlugin = require('copy-webpack-plugin');


let srcRoot = '../src/';

let distWebRoot = '../dist/web/';


baseConfig.output = {
    path: path.join(__dirname, distWebRoot),
    filename: '[name].js',
    chunkFilename: '[name].js?[hash:20]',
    publicPath: '../web/'
}

baseConfig.entry = {
    'web.vue_mode': ['vue', 'vue-property-decorator', 'vue-class-component'],
    'web.lodash': ['lodash'],
    'web.common.env': [
        path.join(__dirname, srcRoot, 'commons/env/base_vue/base.vue.js'),
        path.join(__dirname, srcRoot, 'commons/env/common.env.js')
    ],
    'web.swiper': [path.join(__dirname,  srcRoot, 'commons/assets/swiper/swiper.js')],
    'web.main': path.join(__dirname,  srcRoot, 'page/web/index.js')
};


baseConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: path.join(__dirname, srcRoot, '/page/web/index.tpl.html'),
        minify: {
            removeComments: true,
            collapseWhitespace: true
        },
        filename: path.join(__dirname, '../dist/index.html'),
        cache: true,
        hash: true,
        favicon: path.join(__dirname, srcRoot, 'page/favicon.ico'),
        inject: 'body',
        chunks: ['web.lodash', 'web.vue_mode', 'web.common.env', 'web.swiper', 'web.main']
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: [
            'web.lodash',
            'web.vue_mode',
            'web.common.env',
            'web.swiper'
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
    new webpack.optimize.UglifyJsPlugin(),
    new CopyWebpackPlugin([
        {
            from: path.join(__dirname, srcRoot, 'static'),
            to: path.join(__dirname, distWebRoot, '../static')
        }
    ]),
    new CleanWebpackPlugin(['../dist'], {
        root: __dirname,
        verbose: true,
        dry: false,
        allowExternal: true
    })
);

module.exports = baseConfig;
