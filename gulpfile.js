//initialize all of our variables
var app, base, concat, directory, gulp, gutil, hostname, path, refresh, sass, uglify, imagemin, minifyCSS, del, browserSync, autoprefixer, gulpSequence, shell, sourceMaps, plumber;

var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

//load all of our dependencies
//add more here if you want to include more libraries
gulp          = require('gulp');
gutil         = require('gulp-util');
concat        = require('gulp-concat');
uglify        = require('gulp-uglify');
sass          = require('gulp-sass');
sourceMaps    = require('gulp-sourcemaps');
imagemin      = require('gulp-imagemin');
minifyCSS     = require('gulp-minify-css');
browserSync   = require('browser-sync');
autoprefixer  = require('gulp-autoprefixer');
gulpSequence  = require('gulp-sequence').use(gulp);
shell         = require('gulp-shell');
plumber       = require('gulp-plumber');

gulp.task('browserSync', function() {
  browserSync({
    //browsersync with a php server
    proxy: "juno.dev:8888/", // input your development server address here
    notify: true
  });
});


//compressing images & handle SVG files
gulp.task('images', function(tmp) {
  gulp.src(['assets/img/*.jpg', 'assets/img/*.png'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img'));
});

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
  gulp.src(['assets/img/**/*', '!assets/img/README'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(gulp.dest('dist/img'));
});

//compiling our Javascripts
gulp.task('scripts', function() {
  //this is where our dev JS scripts are
  return gulp.src(['assets/js/**/*.js', 'assets/js/lib/**/*.js'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    //this is the filename of the compressed version of our JS
    .pipe(concat('scripts.js'))
    //catch errors
    .on('error', gutil.log)
    //where we will store our finalized, compressed script
    .pipe(gulp.dest('assets/js'))
    //notify browserSync to refresh
    .pipe(browserSync.reload({stream: true}));
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function() {
  //this is where our dev JS scripts are
  return gulp.src(['assets/js/**/*.js', 'assets/js/lib/**/*.js'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    //this is the filename of the compressed version of our JS
    .pipe(concat('scripts.js'))
    //compress :D
    .pipe(uglify())
    //where we will store our finalized, compressed script
    .pipe(gulp.dest('dist/js'));
});

//compiling our SCSS files
gulp.task('styles', function() {
  //the initializer / master SCSS file, which will just be a file that imports everything
  return gulp.src('assets/sass/main.scss')
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    //get sourceMaps ready
    .pipe(sourceMaps.init())
    //include SCSS and list every "include" folder
    .pipe(sass({
      errLogToConsole: true,
      includePaths: [
        'assets/sass/'
      ]
    }))
    .pipe(autoprefixer({
       browsers: autoPrefixBrowserList,
       cascade:  true
    }))
    //catch errors
    .on('error', gutil.log)
    //the final filename of our combined css file
    .pipe(concat('main.css'))
    //get our sources via sourceMaps
    .pipe(sourceMaps.write())
    //where to save our final, compressed css file
    .pipe(gulp.dest('assets/css'))
    //notify browserSync to refresh
    .pipe(browserSync.reload({stream: true}));
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function() {
  //the initializer / master SCSS file, which will just be a file that imports everything
  return gulp.src('assets/sass/main.scss')
    .pipe(plumber())
    //include SCSS includes folder
    .pipe(sass({
      includePaths: [
        'assets/sass',
      ]
    }))
    .pipe(autoprefixer({
      browsers: autoPrefixBrowserList,
      cascade:  true
    }))
    //the final filename of our combined css file
    .pipe(concat('main.css'))
    .pipe(minifyCSS())
    //where to save our final, compressed css file
    .pipe(gulp.dest('dist/css'));
});

//basically just keeping an eye on all HTML files
gulp.task('php', function() {
  //watch any and all PHP files and refresh when something changes
  return gulp.src('*.php')
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}))
    //catch errors
    .on('error', gutil.log);
});

//migrating over all PHP files for deployment
gulp.task('php-deploy', function() {
  //grab everything, which should include htaccess, robots, etc
  gulp.src('*')
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(gulp.dest('dist'));

  //grab any hidden files too
  gulp.src('.*')
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(gulp.dest('dist'));

  gulp.src('assets/fonts/**/*')
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(gulp.dest('dist/fonts'));

  //grab all of the styles
  gulp.src(['assets/css/*.css', '!assets/css/main.css'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(gulp.dest('dist/css'));
});

//cleans our dist directory in case things got deleted
gulp.task('clean', function() {
  return shell.task([
    'rm -rf dist'
  ]);
});

//create folders using shell
gulp.task('scaffold', function() {
  return shell.task([
      'mkdir dist',
      'mkdir dist/fonts',
      'mkdir dist/images',
      'mkdir dist/js',
      'mkdir dist/css'
    ]
  );
});

//this is our master task when you run `gulp` in CLI / Terminal
//this is the main watcher to use when in active development
//  this will:
//  startup the web server,
//  start up browserSync
//  compress all scripts and SCSS files
gulp.task('default', ['browserSync', 'scripts', 'styles'], function() {
  //a list of watchers, so it will watch all of the following files waiting for changes
  gulp.watch('assets/js/**', ['scripts']);
  gulp.watch('assets/sass/**', ['styles']);
  gulp.watch('assets/img/**', ['images']);
  gulp.watch('*.php', ['php']);
});

//this is our deployment task, it will set everything for deployment-ready files
gulp.task('deploy', gulpSequence('clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'php-deploy'));
