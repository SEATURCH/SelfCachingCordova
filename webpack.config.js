/// <binding BeforeBuild='Run - Development' />
const path = require('path')
var webpack = require('webpack');

module.exports =
    (env, argv) => {
        if (argv.mode === 'development') {
            config.mode = 'development';
        }

        if (argv.mode === 'production') {
            config.mode = 'production';
        }

        return config;
    };

var config = {
    node: {
      fs: 'empty'
    },
    entry: [
        './www/scripts/helper/reqs.js',
        './www/scripts/index.js'
    ],
    output: {
        filename: './bundle/bundle.js',
        path: path.resolve(__dirname, 'www')
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './bundle/fonts/'
                    }
                }]
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true,
                        removeComments: false
                    }
                }
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                VERBOSE: false,
            },
        }),
    ]
}