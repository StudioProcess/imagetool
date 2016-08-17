/* jshint node: true */
/* global $: true */
'use strict';

/*
   FIXME/TODO:
   x wait till upload is finished then reload browser. https://github.com/morris/vinyl-ftp/issues/30#issuecomment-132110746
   x watch for deletions and delete on ftp
   * delete before deploy / or some kind of sync
   * allow browsersync options via config file
   * use mac notifications for errors
   * make this a repo
   * use gulpfile.babel.js
 */


 /**
  *  initialization
  */
// read config files
var config = require('./config.json');
var ftpConfig;
try {
  ftpConfig = require(config.ftpConfig);
} catch (err) {
  console.log('Can\'t find FTP credentials file (ftp.config.json). Please inquire at contact@process.studio.');
  process.exit(1);
}

// init gulp and plugins
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
   pattern: ['gulp-*', 'gulp.*', 'browser-sync', 'main-bower-files', 'vinyl-ftp']
});
var path = require('path');

// configure ftp
ftpConfig.log = $.util.log;
$.ftp = $.vinylFtp.create(ftpConfig);

// configure gulp-notify
// $.notify.logLevel(0);


/**
 *  utilities
 */
// common error handler vor gulp plugins
var errorHandler = function(title) {
   return function(err) {
      $.notify.onError({title: title + ' Error'})(err); // also logs to console
      // $.util.log($.util.colors.red('[' + title + ']'), err.message);
      this.emit('end');
   };
};


/**
 *  start the browsersync server
 */
gulp.task('browsersync', [], function() {
   $.browserSync.init({
      proxy: config.browserSyncProxy,
      browser: config.browser
   });
});


/**
 *  watch files (with livereload via browsersync)
 */
gulp.task('serve', ['browsersync'], function() {
  // watch src files
  // event: {type:'changed'|'deleted'|'added', path:string}
  gulp.watch( config.paths.src, function(event) {
    // console.log(event);
    if (event.type == 'deleted') {
      // delete
      var base = path.normalize(config.basePath);
      var relative = path.relative(base, event.path);
      var remotePath = path.join(ftpConfig.remoteBase, relative);
      // console.log(remotePath);
      $.ftp.delete(remotePath, function() {
        $.browserSync.reload();
      });
    } else {
      // upload
      gulp.src( event.path, {base: config.basePath} )
        .pipe( $.cached() ) // only pass through changed files
        .pipe( $.ftp.dest(ftpConfig.remoteBase) )
        .pipe( $.browserSync.stream({once:true}) )
        .pipe( $.size({showFiles:true}) );
    }
  });
});


/**
 *  deploy to ftp
 */
gulp.task('deploy', ['build'], function() {
   // upload everything in base folder
   // TODO: fix paths beginning with !
   // globs = globs.map(function(path) {
   //    return path.join(config.basePath, path);
   // });
   return gulp.src( config.src.path, {base: config.basePath, buffer: false} )
      .pipe( $.ftp.dest(ftpConfig.remoteBase) );
});


/**
 *  default task
 */
gulp.task('default', ['serve']);
