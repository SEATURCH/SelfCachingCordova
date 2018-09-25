// Implmentors Note: Alan
// Can consider using gulp to initiate unit tests.
// Was originally implemented to utilize the task runner explorer of VS but running webpack in gulp causes issues so abandoned.
// Can consider using gulp to run build tasks but requires changing code to use browserfy or construct own bundle which loses code modularity and requires dev enivornment change.


var gulp = require('gulp');
var htmlmin = require("gulp-htmlmin");
var concat = require('gulp-concat');
var wrapper = require('gulp-wrapper');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var Promise = require('bluebird');
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

var webpack = require("webpack");
var webpackConf = require("./webpack.config.js");
var fs = require('fs');


var config = {
    webpack: function (header) {
        return {
            devtool: 'eval-source-map',
            entry: [
                path.resolve(__dirname, 'www/scripts/index.js')
            ],
            output: {
                filename: './dist/bundle.js',
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
                                outputPath: './dist/fonts/'
                            }
                        }]
                    }
                ]
            },
            plugins: [
                new HtmlWebpackPlugin({
                    filename: '_dist.html',
                    template: 'www/index.html',
                    insert: 'head',
                    header: header
                })
            ]
        }
    }
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
function processHTML() {
    gulp.src([
        './www/html/*.html'
    ])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: false
        }))
        .pipe(wrapper({
            header: '<script type="text/html" id="${filename}">\n',
            footer: '</script>'
        }))
        .pipe(concat('templates.html'))
        .pipe(gulp.dest('www/www/html'))
}

function processSCSS() {
    gulp.src([
        './www/css/*.scss'
    ])
        .pipe(sass())
        .pipe(wrapper({
            header: '/* ${filename} */\n',
        }))
        .pipe(concat('all.css'))
        .pipe(gulp.dest('www/www/css'))
}

function processJS() {
    var bundle = browserify({
        entries: ['./www/scripts/index.js'],
        debug: true
    });

    return bundle.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('www/www/js'));
}

gulp.task('build', function (callback) {
    ensureDirectoryExistence('./www/dist/templates.html');
    fs.writeFileSync('./www/dist/templates.html', "", { flag: 'w' });
    processHTML();
    processSCSS();
    processJS();

    //return new Promise(function (res, rej) {
    //    res(processHTML());
    //}).then(function () {
    //    //console.log(webpackConf)
    //    var header = fs.readFileSync(__dirname + '/www/dist/templates.html');
    //    webpack(config.webpack(header), function (err, stats) { });
    //})
    
});
