var gulp = require('gulp');
var fs = require('fs');
var less = require('gulp-less');
var sass = require('gulp-sass');
var cleancss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var merge = require('merge2');
var config = require('js-yaml').safeLoad(fs.readFileSync('rockety.yml', 'utf8'));

gulp.task('config', function () {
    console.log(JSON.stringify(config, null, 4));
});

function css(config) {
    var stream, vendors = [], vendor, srcLess, srcSass, css;

    (config.css.vendor || []).forEach(function (item) {
        vendors.push('./src/vendor/' + item);
    });
    vendor = gulp.src(vendors);

    if (config.css.styles) {
        srcLess = config.css.styles.less ? config.source + '/less/' + config.css.styles.less : [];
        srcSass = config.css.styles.sass ? config.source + '/sass/' + config.css.styles.sass : [];
        css = merge(
            gulp.src(srcLess).pipe(less()),
            gulp.src(srcSass).pipe(sass())
        ).pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }));
    }

    stream = merge(vendor, css || gulp.src([]));
    if (config.css.sourcemap) { stream = stream.pipe(sourcemaps.init());}
    if (config.css.minify) {    stream = stream.pipe(cleancss());}
                                stream = stream.pipe(concat('style.css'));
    if (config.css.sourcemap) { stream = stream.pipe(sourcemaps.write());}
    stream.pipe(gulp.dest(config.dest + '/css'));
}

config.forEach(function (source) {
    gulp.task('css:' + source.source, function() {return css(source)});
});