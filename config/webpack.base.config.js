// webpack基础配置
let webpack = require('webpack'),
    path = require('path'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin');


// ==>
module.exports = {
    output: {
        path: path.join(__dirname, '../dist'),
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader',
                //include: [path.join(__dirname, '../src/commons')],
                //exclude: /node_modules/
            }, {
                test: /\.js$/,
                use: ['babel-loader'],
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
                    use: ['css-loader', 'postcss-loader', 'sass-loader'],
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
                //include: [path.join(__dirname, '../src/page')],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'vue$': path.join(__dirname, '../node_modules/vue/dist/vue.esm.js'),
            'common.env$': path.join(__dirname, '../src/commons/env/common.env.js'),
            'base.vue$': path.join(__dirname, '../src/commons/env/base_vue/base.vue.js'),
            'swiper$': path.join(__dirname, '../src/commons/assets/swiper/swiper.js')
        }
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../src/static'),
                to: path.join(__dirname, '../dist/static')
            }
        ])
    ]
};
