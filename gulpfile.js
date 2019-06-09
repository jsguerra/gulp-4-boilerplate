// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

// File path variables
const files = {
  scssPath: 'app/scss/**/*.scss',
  cssDest: 'dist/css/',
  jsPath: 'app/js/**/*.js',
  jsDest: 'dist/js/'
}

// Sass task
function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(files.cssDest)
  );
}

// JS task
function jsTask() {
  return src(files.jsPath)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(dest(files.jsDest)
  );
}

// Cachebusting task
const cbString = new Date().getTime();
function cacheBustTask() {
  return src(['index.html'])
    .pipe(replace(/cd=\d+/g, 'cb=' + cbString))
    .pipe(dest('.')
  );
}

// Watch task
function watchTask() {
  watch([files.scssPath, files.jsPath],
    parallel(scssTask, jsTask));
}

// Default task
exports.default = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  watchTask
);