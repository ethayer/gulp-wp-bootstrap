// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var bourbon = require('node-bourbon');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var runTimestamp = Math.round(Date.now()/1000);
var svgmin = require('gulp-svgmin');
var themeName = 'ThemeName';

// Lint Task
gulp.task('lint', function() {
    return gulp.src('wp-content/themes/' + themeName + '/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// font task
gulp.task('Iconfont', function(){
  return gulp.src(['wp-content/themes/' + themeName + '/assets/icons/*.svg'])
  .pipe(iconfont({
    fontName: 'mpls-icon-font', // required
    appendUnicode: true, // recommended option
    normalize: true,
    formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available
    timestamp: runTimestamp, // recommended to get consistent builds when watching files
  }))
  .on('glyphs', function(glyphs, options) {
    // CSS templating, e.g.
    gulp.src('templates/foundation-style.scss')
    .pipe(consolidate('lodash', {
     glyphs: glyphs.map(function(glyph) {
          // this line is needed because gulp-iconfont has changed the api from 2.0
          return { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) }
        }),
     fontName: 'mpls-icon-font',
     fontPath: '../dist/fonts/',
     className: 'icon'
     }))
      .pipe(rename('_font-icons.scss'))
      .pipe(gulp.dest('wp-content/themes/' + themeName + '/scss'));
    })
  .pipe(gulp.dest('wp-content/themes/' + themeName + '/dist/fonts'));
});


// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('wp-content/themes/' + themeName + '/scss/*.scss')
        .pipe(sass({
            includePaths: require('node-bourbon').with('wp-content/themes/' + themeName + '/scss/'),
            errLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('wp-content/themes/make-it-msp/dist'));
});


// Concatenate & Minify JS
gulp.task('vendor-scripts', function() {
    return gulp.src('wp-content/themes/' + themeName + '/js/vendor/*.js')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('wp-content/themes/' + themeName + '/dist'))
        .pipe(rename('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('wp-content/themes/' + themeName + '/dist'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('wp-content/themes/' + themeName + '/js/*.js')
        .pipe(concat('application.js'))
        .pipe(gulp.dest('wp-content/themes/' + themeName + '/dist'))
        .pipe(rename('application.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('wp-content/themes/' + themeName + '/dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('wp-content/themes/' + themeName + '/js/*.js', ['lint', 'scripts']);
    gulp.watch('wp-content/themes/' + themeName + '/js/vendor/*.js', ['vendor-scripts']);
    gulp.watch('wp-content/themes/' + themeName + '/scss/*.scss', ['sass']);
    gulp.watch('wp-content/themes/' + themeName + '/scss/**/*.scss', ['sass']);
    gulp.watch('wp-content/themes/' + themeName + '/assets/icons/*.svg', ['Iconfont']);
});

// Default Task
gulp.task('default', ['Iconfont', 'lint', 'sass', 'scripts', 'vendor-scripts', 'watch']);
