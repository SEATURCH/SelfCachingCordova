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
    entry: [
        './www/scripts/index.js'
    ],
    output: {
        filename: './bundle/startup.js',
        path: path.resolve(__dirname, 'www')
    },
    module: {
        rules: []
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify("NodeGlobal"),
            },
        }),
    ]
}