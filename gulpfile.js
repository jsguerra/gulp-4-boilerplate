// Load Gulp
const { src, dest, watch, series, parallel } = require('gulp');

// CSS related plugins
const sass = require('gulp-sass'),
      cssnano = require('cssnano'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      sourcemaps = require('gulp-sourcemaps');

// JS related plugins
const uglify = require('gulp-uglify');

// Utility plugins
const rename = require('gulp-rename'),
      concat = require('gulp-concat'),
      replace = require('gulp-replace');

// Browers related plugins
const browserSync = require('browser-sync').create();

// File paths
const filePaths = {
  srcSass: 'src/sass',
  srcCss: 'src/css',
  srcJs: 'src/js',
  destCss: 'app/css',
  destJs: 'app/js',
  destFolder: 'app'
}


// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(filePaths.srcSass + '/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      indentType: 'tab',
      indentWidth: '1'
    })
    .on('error', sass.logError))
    .pipe(postcss([ autoprefixer('last 2 versions', '> 1%'), cssnano() ]))
    .pipe(dest(filePaths.srcCss))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(dest(filePaths.destCss))
    .pipe(browserSync.stream()
  );
}

// JS task: 
function jsTask() {
  return src(filePaths.srcJs + '/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(dest(filePaths.destJs))
    .pipe(browserSync.stream()
  );
}

// Cachebusting task
const cbString = new Date().getTime();
function cacheBustTask() {
  return src(['app/index.html'])
    .pipe(replace(/cd=\d+/g, 'cb=' + cbString))
    .pipe(dest(filePaths.destFolder)
  );
}

// Watch task
function watchTask() {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });

  watch([filePaths.srcSass + '/**/*.scss', filePaths.srcJs + '/**/*.js'], parallel(scssTask, jsTask));
  watch(filePaths.destFolder + '**/*').on('change', browserSync.reload);
}

// Default task
exports.default = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  watchTask
);