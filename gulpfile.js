var gulp = require('gulp');
var fs = require('fs');
var merge = require('merge2');
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

gulp.task('config', function () {
    console.log(JSON.stringify(config, null, 4));
});

function css(src) {
    var stream, vendors = [], vendor, css;

    if (!src.css) {
        return;
    }

    (src.css.vendor || []).forEach(function (item) {
        vendors.push('./src/vendor/' + item);
    });
    vendor = gulp.src(vendors);

    if (src.css.styles) {
        css = merge(
            gulp.src(src.css.styles.less ? src.src + '/less/' + src.css.styles.less : []).pipe(less()),
            gulp.src(src.css.styles.sass ? src.src + '/sass/' + src.css.styles.sass : []).pipe(sass())
        ).pipe(autoprefixer(src.css.autoprefixer || {
            browsers: ['last 2 versions'],
        }));
    }

    stream = merge(vendor, css || gulp.src([]));
    if (src.css.sourcemap) {
        stream = stream.pipe(sourcemaps.init());
    }
    if (src.css.minify) {
        stream = stream.pipe(cleancss());
    }
    stream = stream.pipe(concat('style.css'));
    if (src.css.sourcemap) {
        stream = stream.pipe(sourcemaps.write());
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
    var stream, vendors = [], vendor, scripts = [], script;

    if (!src.js) {
        return;
    }

    (src.js.vendor || []).forEach(function (item) {
        vendors.push('./src/vendor/' + item);
    });
    vendor = gulp.src(vendors);

    (src.js.scripts || []).forEach(function (item) {
        scripts.push(src.source + '/js/' + item);
    });
    script = gulp.src(scripts);

    if (scripts.length) {
        script = script.pipe(jshint()).pipe(jshint.reporter('jshint-stylish', {beep: true}));
    }

    stream = merge(vendor, script);
    if (src.js.sourcemap) {
        stream = stream.pipe(sourcemaps.init());
    }
    if (src.js.minify) {
        stream = stream.pipe(uglify().on('error', function(err){}));
    }
    stream = stream.pipe(concat('scripts.js', {newLine: ';'}));
    if (src.js.sourcemap) {
        stream = stream.pipe(sourcemaps.write());
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
        gulp.src(src.watch).pipe(livereload());
    });

    gulp.task('copy:' + src.src, function () {
        (src.copy || []).forEach(function(files) {
            Object.keys(files).forEach(function(src) {
                gulp.src(src).pipe(gulp.dest(files[src])).pipe(livereload());
            });
        });
    });
});

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
        gulp.watch(src.src + '/sass/*.sass', ['css:' + src.src]);
        gulp.watch(src.src + '/sass/*.scss', ['css:' + src.src]);
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
