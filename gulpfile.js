// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp'),
      sass = require('gulp-sass'),
      cssnano = require('cssnano'),
      rename = require('gulp-rename'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),
      replace = require('gulp-replace'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      browserSync = require('browser-sync').create();

// File path variables
const files = {
  source: 'src',
  dist: 'dist',
  scssSrc: 'src/sass/**/*.scss',
  jsSrc: 'src/js/**/*.js',
  cssDest: 'dist/css/',
  jsDest: 'dist/js/'
}

// Sass task
function scssTask() {
  return src(files.scssSrc)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      indentType: 'tab',
      indentWidth: '1'
    })
    .on('error', sass.logError))
    .pipe(postcss([ autoprefixer('last 2 versions', '> 1%'), cssnano() ]))
    .pipe(sourcemaps.write(files.scssSrc + 'maps'))
    .pipe(dest(files.cssDest)
  );
}

// JS task
function jsTask() {
  return src(files.jsSrc)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(files.jsDest)
  );
}

// Cachebusting task
const cbString = new Date().getTime();
function cacheBustTask() {
  return src(['src/index.html'])
    .pipe(replace(/cd=\d+/g, 'cb=' + cbString))
    .pipe(dest(dist)
  );
}

// Watch task
function watchTask() {
  browserSync.init({
    server: {
      baseDir: dist
    }
  });

  watch([files.scssSrc, files.jsSrc],
    parallel(scssTask, jsTask));
}

// Default task
exports.default = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  watchTask
);