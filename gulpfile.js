var gulp=  require('gulp');
var Server = require('karma').Server;
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require('vinyl-buffer');

gulp.task('build', function() {
    return browserify({ 
        entries: ['lib/vivalid.js'],
        standalone: 'vivalid',
    })
    // waiting on https://github.com/substack/node-browserify/issues/968  to use:
    // using https://github.com/substack/browser-pack/compare/master...jmm:standalone-require3
    .require('./lib/vivalid.js', {expose: 'vivalid'})
    .bundle()
    .pipe(source('vivalid-bundle.js'))
    .pipe(gulp.dest('dist'))
    .pipe(buffer())
    .pipe(rename('vivalid-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("dist"));
});

gulp.task('default', ['test']);

gulp.task('test', ['integrationTest','unitTest'], function (done){

});

gulp.task('integrationTest', ['build'], function (done) {

   new Server({
    configFile: __dirname + '/integrationTest.karma.conf.js',
    singleRun: true,
    browsers: ['Firefox']
   }, done).start();
   
});

gulp.task('unitTest', function (done) {
    

});
