var gulp = require('gulp');
var exec = require('child_process').exec;
var browserSync = require('browser-sync').create();

gulp.task('build_py', function(callback) {
  exec('./build.sh', function (err, stdout, stderr) {
    console.log(stdout.slice(0, -1));
    if (stderr != 0) {console.log(stderr);}
    callback(err);
  });
});

gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: 'website'
    },
  })
});

gulp.task('sass', function(callback) {
  exec('sass website/src/sass/homeStylesheet.scss:website/public/css/homeStylesheet.css', function (err, stdout, stderr) {
    // console.log(stdout);
    // console.log(stderr);
    browserSync.reload({
      stream: true
    });
    callback(err);
  });
});

gulp.task('watch', function(callback) {
  gulp.watch('website/src/sass/*.scss', gulp.series('sass')); 
  gulp.watch('website/src/py/*', gulp.series('build_py')); 

  callback();
});

gulp.task('dev', gulp.series('watch', 'server'));
gulp.task('build', gulp.series('build_py', 'sass'));
