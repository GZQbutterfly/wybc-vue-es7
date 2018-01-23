// webpack生产环境配置
let webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    baseConfig = require('./webpack.base.config');



//baseConfig.output.publicPath = "http://qaservice.365bencao.cn/"; //   http://xhjx.365bencao.cn/



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


baseConfig.plugins.push(
    new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/page/web/index.tpl.html'),
        minify: {
            removeComments: true
        },
        hash: true,
        favicon: path.join(__dirname, '../src/page/favicon.ico'),
        inject: 'body',
        chunks: [ 'static/lib/lodash','static/lib/vue_mode', 'sys/env/common.env','sys/plugins/swiper', 'web/main']
    }),
    new HtmlWebpackPlugin({
        filename: path.join(__dirname, '../dist/cms/index.html'),
        template: path.join(__dirname, '../src/page/cms/index.tpl.html'),
        minify: {
            removeComments: true
        },
        hash: true,
        favicon: path.join(__dirname, '../src/page/favicon.ico'),
        inject: 'body',
        chunks: ['static/lib/lodash','static/lib/vue_mode', 'sys/env/common.env','sys/plugins/swiper', 'cms/main']
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
    new ExtractTextPlugin('[name].css'),
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
    }),
    // new UglifyJSPlugin({
    //     test: /\.js$/i
    // }),
    new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
            output: {
                comments: false
            },
            compress: {
                warnings: false
            }
        }
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    })
);

module.exports = baseConfig;
