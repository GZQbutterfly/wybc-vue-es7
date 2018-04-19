// webpack基础配置
let webpack = require('webpack'),
    path = require('path'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HappyPack = require('happypack');
// ==>
module.exports = {
    output: {
        path: path.join(__dirname, '../dist'),
        filename: '[name].js',
        chunkFilename: '[name].js?[hash:20]', // 
        publicPath: '../'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader',
            }, {
                test: /\.js$/,
                use: 'happypack/loader?id=js', // 'happypack/loader?id=js', 
                include: [path.join(__dirname, '../src')],
                exclude: /node_modules/
            }, {
                test: /\.(html|htm)$/,
                use: 'raw-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(scss|css)$/,
                use: ExtractTextPlugin.extract({
                    use: 'happypack/loader?id=css', //'happypack/loader?id=css', //['css-loader', 'postcss-loader', 'sass-loader'],
                    fallback: 'style-loader'
                }),
                exclude: /node_modules/
            },
            {
                test: /\.(png|svg|jpg|gif|eot|woff)$/,
                use: [
                    {
                        loader: 'url-loader?limit=8192&name=static/images/build/[name].[hash:8].[ext]',
                        options: {
                            publicPath: '/'
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': path.join(__dirname, '../node_modules/vue/dist/vue.esm.js'),
            'common.env$': path.join(__dirname, '../src/commons/env/common.env.js'),
            'base.vue$': path.join(__dirname, '../src/commons/env/base_vue/base.vue.js'),
            'swiper$': path.join(__dirname, '../src/commons/assets/swiper/swiper.js'),
        },
        modules: [path.resolve(__dirname, '../src/commons/vue_plugins'), 'node_modules']
    },
    plugins: [
        new HappyPack({
            id: 'js',
            threads: 4,
            loaders: ['babel-loader?cacheDirectory']
        }),
        new HappyPack({
            id: 'css',
            threads: 4,
            loaders: ['css-loader', 'postcss-loader', 'sass-loader']
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../src/static'),
                to: path.join(__dirname, '../dist/static')
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.PACK_V': '-' + Date.now(),
        }),
    ]
};
