var gulp = require('gulp');
var fs = require('fs');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var less = require('gulp-less');
var sass = require('gulp-sass');
var cleancss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var config = require('js-yaml').safeLoad(fs.readFileSync('rockety.yml', 'utf8'));
var sources = [];
var production = false;

gulp.task('config', function () {
    console.log(JSON.stringify(config, null, 4));
});

function css(src) {
    var stream, vendors = [], isLess;

    if (!src.css) {
        return;
    }

    /**
     * Vendor files
     */
    (src.css.vendor || []).forEach(function (item) {
        vendors.push(item);
    });
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

function svg(src) {
    var inline = src.svg.inline || false;
    return gulp.src(src.src + '/svg/*.svg')
        .pipe(rename({prefix: 'shape-'}))
        .pipe(svgmin())
        .pipe(svgstore({
            inlineSvg: inline
        }))
        .pipe(cheerio({
            run: function ($) {
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

function js(src) {
    var stream, vendors = [], scripts = [], stream;

    if (!src.js) {
        return;
    }

    /**
     * Vendor files
     */
    (src.js.vendor || []).forEach(function (item) {
        vendors.push(item);
    });
    if (vendors) {
        gulp.src(vendors)
            .pipe(uglify().on('error', function(err){
                console.log(err);
            }))
            .pipe(concat('vendor.js'))
            .pipe(gulp.dest(src.dest + '/js'));
    }

    /**
     * Own code
     */
    (src.js.scripts || []).forEach(function (item) {
        scripts.push(src.src + '/js/' + item);
    });

    if (!scripts.length) {
        return;
    }

    stream = gulp.src(scripts);

    stream = stream.pipe(jshint()).pipe(jshint.reporter('jshint-stylish', {beep: true}));

    if (src.js.sourcemap && !production) {
        stream = stream.pipe(sourcemaps.init());
    }
    if (src.js.minify || production) {
        stream = stream.pipe(uglify().on('error', function(err){}));
    }
    stream = stream.pipe(concat('bundle.js', {newLine: ';'}));
    if (src.js.sourcemap && !production) {
        stream = stream.pipe(sourcemaps.write(src.js.sourcemapLocation || null));
    }
    stream = stream.pipe(gulp.dest(src.dest + '/js'));
    stream.pipe(livereload());
}

config.sources.forEach(function (src) {
    sources.push(src.src);
    gulp.task('css:' + src.src, function () {
        return css(src)
    });
    gulp.task('svg:' + src.src, function () {
        return svg(src)
    });
    gulp.task('js:' + src.src, function () {
        return js(src)
    });

    gulp.task('reload:' + src.src, function () {
        if (src.watch) {
            gulp.src(src.watch).pipe(livereload());
        }
    });

    gulp.task('copy:' + src.src, function () {
        (src.copy || []).forEach(function(files) {
            Object.keys(files).forEach(function(src) {
                gulp.src(src).pipe(gulp.dest(files[src])).pipe(livereload());
            });
        });
    });
});

function productionBuild() {
    production = true;
    runSequence(['css', 'svg', 'js', 'copy'], function() {
        production = false;
    });
}

gulp.task('css', (sources.map(function(src) {
    return 'css:' + src;
})), function () {});
gulp.task('svg', (sources.map(function(src) {
    return 'svg:' + src;
})), function () {});
gulp.task('js', (sources.map(function(src) {
    return 'js:' + src;
})), function () {});
gulp.task('reload', (sources.map(function(src) {
    return 'reload:' + src;
})), function () {});
gulp.task('copy', (sources.map(function(src) {
    return 'copy:' + src;
})), function () {});

gulp.task('build', ['css', 'svg', 'js', 'copy'], function () {});
gulp.task('build:production', [], productionBuild);
gulp.task('build:prod', [], productionBuild);

gulp.task('watch', function () {
    var port = config.options.livereloadPort || 35729;
    livereload.listen({
        port: port
    });
    setTimeout(function() {
        console.log('Livereload started on port ' + port);
    });

    config.sources.forEach(function(src) {
        gulp.watch(src.src + '/less/*.less', ['css:' + src.src]);
        gulp.watch([src.src + '/sass/*.sass', src.src + '/sass/*.scss'], ['css:' + src.src]);
        gulp.watch(src.src + '/svg/*.svg', ['svg:' + src.src]);
        gulp.watch(src.src + '/js/*.js', ['js:' + src.src]);
        gulp.watch(src.watch || [], ['reload:' + src.src]);
        var copySources = [];
        (src.copy || []).forEach(function(files) {
            Object.keys(files).forEach(function(src) {
                copySources.push(src);
            });
        });
        gulp.watch(copySources, ['copy:' + src.src]);
    });
});
