// webpack开发环境配置
let webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    baseConfig = require('./webpack.base.config');



//baseConfig.output.publicPath = '../'; 

// baseConfig.module.rules.unshift({
//     enforce: 'pre',
//     test: /\.js$/,
//     use: 'eslint-loader',
//     exclude: /node_modules/,
//     include: [path.join(__dirname, '../src/page')]
// })

baseConfig.entry = {

    'static/lib/vue_mode': ['vue', 'vue-property-decorator', 'vue-class-component'],
    'static/lib/lodash': ['lodash'],
    'sys/env/common.env': [
        path.join(__dirname, '../src/commons/env/base_vue/base.vue.js'),
        path.join(__dirname, '../src/commons/env/common.env.js')
    ],
    'sys/plugins/swiper': [path.join(__dirname, '../src/commons/assets/swiper/swiper.js')],
    // main 
    'web/main': path.join(__dirname, '../src/page/web/index.js'),
    'cms/main': path.join(__dirname, '../src/page/cms/index.js'),
};

// 文件映射
baseConfig.devtool = 'source-map';

// 插件
baseConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/page/web/index.tpl.html'),
        minify: {
            removeComments: true
        },
        cache: true,
        hash: true,
        favicon: path.join(__dirname, '../src/page/favicon.ico'),
        inject: 'body',
        chunks: ['static/lib/lodash', 'static/lib/vue_mode', 'sys/env/common.env', 'sys/plugins/swiper', 'web/main']
    }),
    new HtmlWebpackPlugin({
        filename: path.join(__dirname, '../dist/cms/index.html'),
        template: path.join(__dirname, '../src/page/cms/index.tpl.html'),
        minify: {
            removeComments: true
        },
        cache: true,
        hash: true,
        favicon: path.join(__dirname, '../src/page/favicon.ico'),
        inject: 'body',
        chunks: ['static/lib/lodash', 'static/lib/vue_mode', 'sys/env/common.env', 'sys/plugins/swiper', 'cms/main']
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: [
            'static/lib/lodash',
            'static/lib/vue_mode',
            'sys/env/common.env',
            'sys/plugins/swiper'
        ],
        minChunks: Infinity
    }),
    new ExtractTextPlugin({ filename: '[name].css', disable: false, allChunks: true }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    new CleanWebpackPlugin(['../dist'], {
        root: __dirname,
        verbose: true,
        dry: false,
        allowExternal: true
    })
);

module.exports = baseConfig;
