var gulp = require('gulp'),
    connect = require('gulp-connect'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    paths = {
      'scripts': ['lib/**/*.js'],
      'root': ['build', 'example', 'bower_components'],
      'reload':['build/**/*.js', 'example/**/*']
    };


gulp.task("connect", function() {
  connect.server({
    root: paths.root,
    port: 8080,
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.reload, ['reload']);
});

gulp.task('reload', function() {
  gulp.src('')
  .pipe(connect.reload());
});

gulp.task('scripts', function() {
  gulp.src('index.js')
    .pipe(browserify())
    .pipe(concat('euclid.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task("default", ['connect', 'watch', 'scripts']);