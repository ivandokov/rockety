const gulp = require('gulp');
const express = require('express');
const fs = require('fs');
const path = require('path');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const less = require('gulp-less');
const sass = require('gulp-sass');
const minifycss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');
const chalk = require('chalk');
let config = require('js-yaml').safeLoad(fs.readFileSync('rockety.yml', 'utf8'));
let sources = Object.keys(config.sources);
let production = false;

const css = src => {
    let stream, vendors = [];

    if (!src.css) return;

    (src.css.vendor || []).forEach(item => vendors.push(item));
    if (vendors.length) gulp.src(vendors)
        .pipe(minifycss())
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(`${src.dest}/css`));

    if (!src.css.main) return;

    stream = gulp.src(`${src.src}/css/${src.css.main}`);
    stream.on('error', err => console.log(chalk.red(err.message)));
    if (!production) stream = stream.pipe(sourcemaps.init());
    stream = stream.pipe(src.css.main.match(/\.less$/) ? less() : sass().on('error', sass.logError));
    stream = stream.pipe(autoprefixer(config.options.autoprefixer || {browsers: ['last 2 versions']}));
    if (production) stream = stream.pipe(minifycss());
    stream = stream.pipe(concat('style.css'));

    if (!production)
        stream = stream.pipe(sourcemaps.write());

    stream = stream.pipe(gulp.dest(`${src.dest}/css`));
    stream.pipe(livereload());
}

const svg = src => {
    let inline = config.options.svgInline || false;
    return gulp.src(`${src.src}/svg/*.svg`)
        .pipe(rename({prefix: 'shape-'}))
        .pipe(svgmin())
        .pipe(svgstore({inlineSvg: inline}))
        .pipe(cheerio({
            run: $ => {
                $('svg').attr('style', 'display:none');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(rename('shapes.svg'))
        .pipe(gulp.dest(`${src.dest}/svg`))
        .pipe(livereload());
}

const js = src => {
    let stream, vendors = [];

    if (!src.js) return;

    (src.js.vendor || []).forEach(item => vendors.push(item));

    if (config.options.babelPolyfill)
        vendors.push('node_modules/babel-polyfill/dist/polyfill.min.js');

    if (vendors) gulp.src(vendors)
        .pipe(uglify().on('error', err => console.log(chalk.red(err.message))))
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(`${src.dest}/js`));

    if (!src.js.main) return;

    stream = gulp.src(`${src.src}/js/${src.js.main}`);
    stream = stream.pipe(eslint()).pipe(eslint.format());

    if (!production) stream = stream.pipe(sourcemaps.init());

    stream = stream.pipe(babel({
        "presets": ["env"]
    }).on('error', err => console.log(chalk.red(err.message))));

    if (!production) stream = stream.pipe(sourcemaps.write());

    stream = stream.pipe(webpackStream({
        resolve: {
            modules: [path.resolve(__dirname, `${src.src}/js`), path.resolve(__dirname, 'node_modules')]
        },
        devtool: production ? 'none' : 'cheap-module-eval-source-map',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'source-map-loader',
                    enforce: "pre"
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'stage-0']
                    }
                }
            ]
        }
    }, webpack).on('error', err => console.log(chalk.red(err.message))));

    if (production) stream = stream.pipe(uglify().on('error', err => console.log(chalk.red(err.message))));

    stream = stream.pipe(concat('bundle.js'));
    stream = stream.pipe(gulp.dest(`${src.dest}/js`));
    stream.pipe(livereload());
}

for (const sourceName of sources) {
    const sourceConfig = config.sources[sourceName];
    gulp.task(`css:${sourceName}`, () => css(sourceConfig));
    gulp.task(`svg:${sourceName}`, () => svg(sourceConfig));
    gulp.task(`js:${sourceName}`, () => js(sourceConfig));
}

gulp.task('config', () => {console.log(JSON.stringify(config, null, 4))});
gulp.task('css', sources.map(src => `css:${src}`), () => {});
gulp.task('svg', sources.map(src => `svg:${src}`), () => {});
gulp.task('js', sources.map(src => `js:${src}`), () => {});
gulp.task('reload', () => {
    livereload.reload();
});
gulp.task('build', ['css', 'svg', 'js'], () => {});

const productionBuild = () => {
    production = true;
    runSequence(
        ['css', 'svg', 'js'],
        () => { production = false }
    );
}
gulp.task('build:production', [], productionBuild);
gulp.task('build:prod', [], productionBuild);

var watch = () => {
    const port = config.options.livereloadPort || 35729;
    livereload.listen({port: port});
    setTimeout(() => console.log(chalk.green(`Livereload started on port ${port}`)));

    for (const sourceName of sources) {
        const sourceConfig = config.sources[sourceName];

        gulp.watch(`${sourceConfig.src}/css/**/*.{scss,less}`, [`css:${sourceName}`]);
        gulp.watch(`${sourceConfig.src}/svg/**/*.svg`, [`svg:${sourceName}`]);
        gulp.watch(`${sourceConfig.src}/js/**/*.js`, [`js:${sourceName}`]);
    }

    for (const watcher of (config.options.watch || [])) {
        const path = Object.keys(watcher)[0];
        gulp.watch(path, watcher[path]);
    }
};

gulp.task('watch', watch);

gulp.task('serve', ['build'], () => {
    const port = 8000;
    const app = express();
    const views = path.join(__dirname, 'public');

    app.set('views', views);
    app.engine('html', require('ejs').renderFile);

    app.use(express.static('public', {
        dotfiles: 'ignore',
        etag: false,
        index: false,
        maxAge: '0',
        setHeaders: (res, path, stat) => res.set('x-timestamp', Date.now())
    }))

    app.use((req, res) => {
        var requestedView = path.parse(req.path);
        var viewPath = requestedView.dir;
        var viewName = requestedView.name ? requestedView.name : 'index';
        var filePath = path.join(views, viewPath, viewName) + '.html';

        if (viewName === 'favicon') {
            res.send();
            return;
        }

        if (fs.existsSync(filePath))
            res.render(filePath);
        else
            res.send(`View not found! [${filePath}]`);
    });

    app.listen(port, () => console.log(chalk.green(`Rockety started at http://localhost:${port}`)));

    watch();
});

gulp.task('default', ['build', 'serve']);