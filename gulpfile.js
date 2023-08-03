var gulp = require('gulp');
var exec = require('child_process').exec;
var browserSync = require('browser-sync').create();

gulp.task('date', function(callback) {
  exec('cd website/src/py\npython3 update_date.py\ncd ../../..', function (err, stdout, stderr) {
    console.log(stdout.slice(0, -1));
    if (stderr != 0) {console.log(stderr);}
    callback(err);
  });
});

gulp.task('build_page', function(callback) {
  exec('cd website/src/py\npython3 staticPageGenerator.py\ncd ../../..', function (err, stdout, stderr) {
    console.log(stdout.slice(0, -1));
    if (stderr != 0) {console.log(stderr);}
    callback(err);
  });
});

gulp.task('build_pic_manifest', function(callback) {
  exec('cd website/src/py\npython3 build_image_manifest.py\ncd ../../..', function (err, stdout, stderr) {
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

  exec('sass website/src/sass/projectGridStylesheet.scss:website/public/css/projectGridStylesheet.css', function (err, stdout, stderr) {
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
  gulp.watch('website/src/py/*', gulp.series('build_page')); 
  gulp.watch('website/data/p*', gulp.series('build_page')); 

  callback();
});

gulp.task('build_py', gulp.series('date', 'build_page'));


gulp.task('dev', gulp.series('watch', 'server'));
gulp.task('build', gulp.series('build_py', 'build_pic_manifest', 'sass'));
