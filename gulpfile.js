const gulp = require('gulp')
const insert = require('gulp-insert')

gulp.task('index', function() {
  return gulp
    .src('./dist/bin/*.js')
    .pipe(insert.prepend('#!/usr/bin/env node\n\n'))
    .pipe(gulp.dest('./dist/bin'))
})
