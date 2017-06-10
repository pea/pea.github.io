const babel = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cleanCSS = require('gulp-clean-css');
const concatCss = require('gulp-concat-css');
const gulpSequence = require('gulp-sequence');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');
const watchify = require('watchify');
const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');

/**
 * Watch Functions
 */
gulp.task('watch', () => {
    watchScss();
    watchJs(true);
});

/**
 * Convert SCSS to CSS
 */
gulp.task('scss', () => {
    /**
     * main.scss
     */
    gulp.src('src/scss/main.scss')
        .pipe(plumber({
            errorHandler(err) {
                notify.onError('Error: <%= error.message %>')(err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(cleanCSS({ compatibility: 'ie8', keepSpecialComments: 0 }))
        .pipe(gulp.dest('dist'))
        .pipe(notify('Finished: <%= file.relative %>'));
});

/**
 * Minify CSS in main.css file
 */
gulp.task('minifyCss', () => {
    gulp.src('dist/**/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8', keepSpecialComments: 0 }))
        .pipe(gulp.dest('dist'));
});

/**
 * Uglify JavaScript
 */
gulp.task('uglifyJs', () => {
    gulp.src('dist/build.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

/**
 * Monitor SCSS files and process if changed
 * @return {[obj]} Gulp Watch object
 */
function watchScss() {
    gulp.watch(['src/scss/**/*.scss'], ['scss']);
}

/**
 * Monitor JS files and process if changed
 * @param  {[obj]} restart Restart watch when done
 * @return {[null]} Void
 */
function watchJs(restart) {
    const bundler = watchify(browserify('./src/js/main.js', { debug: true }).transform('babelify', { presets: ['es2015'] }));
    function rebundle() {
        bundler.bundle()
            .on('error', function (err) {
                notify.onError('Error: <%= error.message %>')(err);
                this.emit('end');
            })
            .pipe(source('build.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'))
            .pipe(notify('Finished: <%= file.relative %>'));
    }
    if (restart) {
        bundler.on('update', () => {
            rebundle();
        });
    }
    rebundle();
}


/**
 * Produce production version of CSS and JS
 */
gulp.task('production', gulpSequence(
    'scss',
    'minifyCss',
    'uglifyJs'
));
