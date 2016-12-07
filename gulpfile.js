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

function css(config) {
    var stream, vendors = [], vendor, css;

    if (!config.css) {
        return;
    }

    (config.css.vendor || []).forEach(function (item) {
        vendors.push('./src/vendor/' + item);
    });
    vendor = gulp.src(vendors);

    if (config.css.styles) {
        css = merge(
            gulp.src(config.css.styles.less ? config.source + '/less/' + config.css.styles.less : []).pipe(less()),
            gulp.src(config.css.styles.sass ? config.source + '/sass/' + config.css.styles.sass : []).pipe(sass())
        ).pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }));
    }

    stream = merge(vendor, css || gulp.src([]));
    if (config.css.sourcemap) {
        stream = stream.pipe(sourcemaps.init());
    }
    if (config.css.minify) {
        stream = stream.pipe(cleancss());
    }
    stream = stream.pipe(concat('style.css'));
    if (config.css.sourcemap) {
        stream = stream.pipe(sourcemaps.write());
    }
    stream = stream.pipe(gulp.dest(config.dest + '/css'));
    stream.pipe(livereload());
}

function svg(config) {
    return gulp.src(config.source + '/svg/*.svg')
        .pipe(rename({prefix: 'shape-'}))
        .pipe(svgmin())
        .pipe(svgstore())
        .pipe(cheerio({
            run: function ($) {
                $('svg').attr('style', 'display:none');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(rename('shapes.svg'))
        .pipe(gulp.dest(config.dest + '/svg'))
        .pipe(livereload());
}

function js(config) {
    var stream, vendors = [], vendor, scripts = [], script;

    if (!config.js) {
        return;
    }

    (config.js.vendor || []).forEach(function (item) {
        vendors.push('./src/vendor/' + item);
    });
    vendor = gulp.src(vendors);

    (config.js.scripts || []).forEach(function (item) {
        scripts.push(config.source + '/js/' + item);
    });
    script = gulp.src(scripts);

    if (scripts.length) {
        script = script.pipe(jshint()).pipe(jshint.reporter('jshint-stylish', {beep: true}));
    }

    stream = merge(vendor, script);
    if (config.js.sourcemap) {
        stream = stream.pipe(sourcemaps.init());
    }
    if (config.js.minify) {
        stream = stream.pipe(uglify());
    }
    stream = stream.pipe(concat('scripts.js', {newLine: ';'}));
    if (config.js.sourcemap) {
        stream = stream.pipe(sourcemaps.write());
    }
    stream = stream.pipe(gulp.dest(config.dest + '/js'));
    stream.pipe(livereload());
}


config.forEach(function (source) {
    sources.push(source.source);
    gulp.task('css:' + source.source, function () {
        return css(source)
    });
    gulp.task('svg:' + source.source, function () {
        return svg(source)
    });
    gulp.task('js:' + source.source, function () {
        return js(source)
    });

    gulp.task('reload:' + source.source, function () {
        gulp.src(source.watch).pipe(livereload());
    });

    gulp.task('copy:' + source.source, function () {
        (source.copy || []).forEach(function(files) {
            Object.keys(files).forEach(function(src) {
                gulp.src(src).pipe(gulp.dest(files[src])).pipe(livereload());
            });
        });
    });
});

gulp.task('css', (sources.map(function(source) {
    return 'css:' + source;
})), function () {});
gulp.task('svg', (sources.map(function(source) {
    return 'svg:' + source;
})), function () {});
gulp.task('js', (sources.map(function(source) {
    return 'js:' + source;
})), function () {});
gulp.task('reload', (sources.map(function(source) {
    return 'reload:' + source;
})), function () {});
gulp.task('copy', (sources.map(function(source) {
    return 'copy:' + source;
})), function () {});

gulp.task('build', ['css', 'svg', 'js'], function () {});

gulp.task('watch', function () {
    livereload.listen();
    config.forEach(function(source) {
        gulp.watch(source.source + '/less/*.less', ['css:' + source.source]);
        gulp.watch(source.source + '/sass/*.sass', ['css:' + source.source]);
        gulp.watch(source.source + '/sass/*.scss', ['css:' + source.source]);
        gulp.watch(source.source + '/svg/*.svg', ['svg:' + source.source]);
        gulp.watch(source.source + '/js/*.js', ['js:' + source.source]);
        gulp.watch(source.watch || [], ['reload:' + source.source]);
        var copySources = [];
        (source.copy || []).forEach(function(files) {
            Object.keys(files).forEach(function(src) {
                copySources.push(src);
            });
        });
        gulp.watch(copySources, ['copy:' + source.source]);
    });
});