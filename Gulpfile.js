/**
 * Technology Radar 2015
 * Copyright (c) 2015 Urban Sanden
 */


/*-------------------------------------------------------------------

    Required plugins

-------------------------------------------------------------------*/

var
  gulp        = require('gulp'),
  package     = require('./package.json'),
  clean       = require('gulp-clean'),
  concat      = require('gulp-concat'),
  cssmin      = require('gulp-cssmin'),
  filter      = require('gulp-filter'),
  gulpif      = require('gulp-if'),
  imagemin    = require('gulp-imagemin'),
  header      = require('gulp-header'),
  rename      = require('gulp-rename'),
  sass        = require('gulp-ruby-sass'),
  uglify      = require('gulp-uglify'),
  browserSync = require('browser-sync'),
  prefix      = require('gulp-autoprefixer'),
  pngcrush    = require('imagemin-pngcrush'),
  reload      = browserSync.reload;

/*-------------------------------------------------------------------

  1. Configuration
  Base paths

-------------------------------------------------------------------*/

var basePaths = {
  assets: {
    dist: 'dist/'
  },
  scripts: {
    base: 'js/views/',
    dist: 'dist/'
  },
  vendorjs: {
    base: 'js/vendor/',
  },
  bowerjs: {
    base: 'bower_components/',
  },
  scss: {
    base: 'scss/',
    dist: 'dist/'
  },
  html: {
    base: './',
    dist: './'
  },
  images: {
    base: 'images/',
    dist: 'images/'
  },
};

/*-------------------------------------------------------------------

  2. Application paths

-------------------------------------------------------------------*/

var appFiles = {
  versioning: [
    './package.json',
    './bower.json'
  ],

  scripts: basePaths.scripts.base + '*.js',
  scss: basePaths.scss.base + '**/*.scss',
  html: basePaths.html.base + '**/*.html',
  images: basePaths.images.base + '**/*'

};

/*-------------------------------------------------------------------

  Banner using meta data from package.json

-------------------------------------------------------------------*/

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');


/*-------------------------------------------------------------------

    Tasks

-------------------------------------------------------------------*/

// Clean /dist folder
gulp.task('clean:before', function() {
  return gulp.src(
      basePaths.assets.dist
    )
    .pipe(clean({
      force: true
    }))
});

// Concat and Uglify Javascript
gulp.task('scripts', function() {
  return gulp.src([
      basePaths.bowerjs.base + 'jquery/dist/jquery.js',
      basePaths.bowerjs.base + 'jquery-smartresize/jquery.debouncedresize.js',
      basePaths.bowerjs.base + '/jquery-smartresize/jquery.throttledresize.js',
      basePaths.bowerjs.base + 'fastclick/lib/fastclick.js',
      basePaths.bowerjs.base + 'blueimp-md5/js/md5.js',
      basePaths.bowerjs.base + 'handlebars/handlebars.js',
      basePaths.scripts.base + '*.js'
    ])
    .pipe(concat(
      'radar.js'
    ))
    .pipe(reload({
      stream: true
    }))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      package: package
    }))
    .pipe(gulp.dest(
      basePaths.scripts.dist
    ))
});

// Handle images with imagemin and pngcrush
gulp.task('images', function() {
  return gulp.src(appFiles.images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngcrush()]
    }))
    .pipe(gulp.dest(
      basePaths.images.dist
    ))
  browserSync.reload();
});

// Compile Sass with Ruby-Sass, compressed format without line numbers. Console log errors.
gulp.task('sass', function() {
  return gulp.src(appFiles.scss)
    .pipe(sass({
      style: 'expanded',
      lineNumbers: true
    }))
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(cssmin())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(prefix('>1%', 'last 4 versions',  'android', 'ios'))
    .pipe(header(banner, {
      package: package
    }))
    .pipe(gulp.dest(
      basePaths.scss.dist
    ))
    .pipe(reload({
      stream: true
    }));
});

// Browser sync using proxy vhost, open in Google Chrome. Use port 5000. Don't output default Browser Sync notify alerts
gulp.task('browser-sync', function() {
  browserSync({
    proxy: 'radar.loc',
    browser: "google chrome",
    port: 7000,
    notify: false,
  });
});

// Browser sync reload
gulp.task('bs-reload', function() {
  browserSync.reload();
});

// Task: Watch files
gulp.task('watch', function() {

  // Watch scripts
  gulp.watch(appFiles.scripts, ['scripts', browserSync.reload]);

  // Watch Sass
  gulp.watch(appFiles.scss, ['sass']);

  // Watch HTML, and reload browser
  gulp.watch(appFiles.html, ['bs-reload']);

});

/*-------------------------------------------------------------------

    Main tasks

-------------------------------------------------------------------*/

// Default. Just runs once.
// Type 'gulp' in the terminal
gulp.task('default', ['clean:before'], function() {
  gulp.start(
    'sass',
    'images',
    'scripts'
  );
});


// Production process. Watch, inject, and reload.
// Type 'gulp serve' in the terminal
gulp.task('serve', ['clean:before'], function() {
  gulp.start(
    'browser-sync',
    'sass',
    'scripts',
    'watch'
  );
});