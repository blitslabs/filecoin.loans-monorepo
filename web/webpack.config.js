const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
// react webpack express babel
// https://levelup.gitconnected.com/how-to-setup-environment-using-react-webpack-express-babel-d5f1b572b678
// nodemon and webpack dev server
// https://itnext.io/auto-reload-a-full-stack-javascript-project-using-nodemon-and-webpack-dev-server-together-a636b271c4e
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    entry: {
        bundle: path.join(__dirname, 'app_src', 'index.js'),
        //admin: path.join(__dirname, 'admin_src','index.js')
    },
    module: {
        defaultRules: [
            {
                type: "javascript/auto",
                resolve: {}
            },
            {
                test: /\.json$/i,
                type: "json"
            },
        ],
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.wasm$/,
                loaders: ['wasm-loader']
            }

        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        // aliasFields: ['browser', 'browser.esm'],
        // alias: {
        //     https: 'https-browserify',
        //     http: 'stream-http',
        //     stream: 'stream-browserify',
        //     os: 'os-browserify/browser',
        //     crypto: 'crypto-browserify',
        //     // process: "process/browser",
        //     buffer: 'buffer'
        // },
        // fallback: {
        //     buffer: require.resolve("buffer/")
        // }

        // fallback: {
        //     'stream': path.join(__dirname, '/node_modules', 'stream-browserify'),
        //     'https': path.join(__dirname, '/node_modules', 'https-browserify'),
        //     'os': path.join(__dirname, '/node_modules', 'os-browserify/browser'),
        //     'http': path.join(__dirname, '/node_modules', 'stream-http'),
        //     'crypto': path.join(__dirname, '/node_modules', 'crypto-browserify')
        // }
    },
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: '[name].js',
        // chunkFilename: '[name].[chunkhash].js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new Dotenv(),
        // new webpack.ProvidePlugin({
        //     Buffer: ['buffer', 'Buffer'],
        //     process: 'process/browser',
        // }),

    ],

    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        host: 'localhost', // localhost
        port: 8080,
        contentBase: path.join(__dirname, '/public'),
        watchContentBase: true,
        // proxy: [
        //     {
        //         context: ['^/api/*', '^/app/*'],
        //         target: 'http://localhost:3000/',
        //         secure: false
        //     }
        // ],
        overlay: {
            warnings: false,
            errors: true
        }
    },
}