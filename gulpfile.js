const gulp = require('gulp');
const express = require('express');
const fs = require('fs');
const path = require('path');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const less = require('gulp-less');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');
const chalk = require('chalk');
let config = require('js-yaml').safeLoad(fs.readFileSync('rockety.yml', 'utf8'));
let sources = [];
let production = false;

gulp.task('config', () => {
    console.log(JSON.stringify(config, null, 4));
});

const css = src => {
    let stream, vendors = [], isLess;

    if (!src.css) {
        return;
    }

    /**
     * Vendor files
     */
    (src.css.vendor || []).forEach(item => vendors.push(item));
    if (vendors.length) {
        gulp.src(vendors)
            .pipe(cleancss())
            .pipe(concat('vendor.css'))
            .pipe(gulp.dest(src.dest + '/css'));
    }

    /**
     * Own styles
     */
    if (!src.css.styles.less && !src.css.styles.sass) {
        return;
    }

    isLess = src.css.styles.less ? true : false;

    stream = isLess ?
        gulp.src(src.css.styles.less ? src.src + '/less/' + src.css.styles.less : []) :
        gulp.src(src.css.styles.sass ? src.src + '/sass/' + src.css.styles.sass : []);

    if (src.css.sourcemap && !production) {
        stream = stream.pipe(sourcemaps.init());
    }

    stream = stream.pipe(isLess ? less() : sass());
    stream.on('error', err => {
        console.log(chalk.red(err.message));
    });

    stream = stream.pipe(autoprefixer(src.css.autoprefixer || {
        browsers: ['last 2 versions'],
    }));

    if (src.css.minify || production) {
        stream = stream.pipe(cleancss());
    }

    stream = stream.pipe(concat('style.css'));

    if (src.css.sourcemap && !production) {
        stream = stream.pipe(sourcemaps.write(src.css.sourcemapLocation || null));
    }

    stream = stream.pipe(gulp.dest(src.dest + '/css'));
    stream.pipe(livereload());
}

const svg = src => {
    let inline = src.svg.inline || false;
    return gulp.src(src.src + '/svg/*.svg')
        .pipe(rename({prefix: 'shape-'}))
        .pipe(svgmin())
        .pipe(svgstore({inlineSvg: inline}))
        .pipe(cheerio({
            run: $ => {
                if (!inline) {
                    $('svg').attr('style', 'display:none');
                }
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(rename('shapes.svg'))
        .pipe(gulp.dest(src.dest + '/svg'))
        .pipe(livereload());
}

const js = src => {
    let stream, vendors = [], scripts = [];

    if (!src.js) {
        return;
    }

    /**
     * Vendor files
     */
    (src.js.vendor || []).forEach(item => vendors.push(item));
    if (vendors) {
        gulp.src(vendors)
            .pipe(uglify().on('error', err => console.log(chalk.red(err.message))))
            .pipe(concat('vendor.js'))
            .pipe(gulp.dest(src.dest + '/js'));
    }

    /**
     * Own code
     */
    (src.js.scripts || []).forEach(item => scripts.push(src.src + '/js/' + item));

    if (!scripts.length) {
        return;
    }

    stream = gulp.src(scripts);

    stream = stream.pipe(jshint()).pipe(jshint.reporter('jshint-stylish', {beep: true}));

    if (src.js.sourcemap && !production) {
        stream = stream.pipe(sourcemaps.init());
    }
    if (src.js.minify || production) {
        stream = stream.pipe(uglify().on('error', err => {}));
    }
    stream = stream.pipe(concat('bundle.js', {newLine: ';'}));
    if (src.js.sourcemap && !production) {
        stream = stream.pipe(sourcemaps.write(src.js.sourcemapLocation || null));
    }
    stream = stream.pipe(gulp.dest(src.dest + '/js'));
    stream.pipe(livereload());
}

config.sources.forEach(src => {
    sources.push(src.src);
    gulp.task('css:' + src.src, () => css(src));
    gulp.task('svg:' + src.src, () => svg(src));
    gulp.task('js:' + src.src, () => js(src));

    gulp.task('reload:' + src.src, () => {
        if (src.watch) {
            gulp.src(src.watch).pipe(livereload());
        }
    });

    gulp.task('copy:' + src.src, () => {
        (src.copy || []).forEach(files => {
            Object.keys(files).forEach(src => gulp.src(src).pipe(gulp.dest(files[src])).pipe(livereload()));
        });
    });
});

const productionBuild = () => {
    production = true;
    runSequence(['css', 'svg', 'js', 'copy'], production = false);
}

gulp.task('css', sources.map(src => 'css:' + src), () => {});
gulp.task('svg', sources.map(src => 'svg:' + src), () => {});
gulp.task('js', sources.map(src => 'js:' + src), () => {});
gulp.task('reload', sources.map(src => 'reload:' + src), () => {});
gulp.task('copy', sources.map(src => 'copy:' + src), () => {});
gulp.task('build', ['css', 'svg', 'js', 'copy'], () => {});
gulp.task('build:production', [], productionBuild);
gulp.task('build:prod', [], productionBuild);

var watch = () => {
    const port = config.options.livereloadPort || 35729;
    livereload.listen({port: port});
    setTimeout(() => console.log(chalk.green('Livereload started on port ' + port)));

    config.sources.forEach(src => {
        gulp.watch(src.src + '/less/*.less', ['css:' + src.src]);
        gulp.watch([src.src + '/sass/*.sass', src.src + '/sass/*.scss'], ['css:' + src.src]);
        gulp.watch(src.src + '/svg/*.svg', ['svg:' + src.src]);
        gulp.watch(src.src + '/js/*.js', ['js:' + src.src]);
        gulp.watch(src.watch || [], ['reload:' + src.src]);
        var copySources = [];
        (src.copy || []).forEach(files => {
            Object.keys(files).forEach(src => copySources.push(src));
        });
        gulp.watch(copySources, ['copy:' + src.src]);
    });
};

gulp.task('watch', watch);

gulp.task('serve', [], () => {
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
        setHeaders: (res, path, stat) => {
            res.set('x-timestamp', Date.now())
        }
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

        if (fs.existsSync(filePath)) {
            res.render(filePath);
        } else {
            res.send('View not found! ['+ filePath +']');
        }
    });

    app.listen(port, () => console.log(chalk.green('Rockety started at http://localhost:' + port)));

    watch();
});