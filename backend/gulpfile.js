/* jshint node: true */
/* global $: true */
'use strict';

/*
   FIXME/TODO:
   * delete before deploy / or some kind of sync
   * make this a repo
   * use mac notifications for errors
   * wait till upload is finished then reload browser
   * watch for deletions and delete on ftp
 */


 /**
  *  initialization
  */
// read config files
var config = require('./config.json');
var ftpConfig = require(config.ftpConfig);

// init gulp and plugins
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
   pattern: ['gulp-*', 'gulp.*', 'browser-sync', 'main-bower-files', 'vinyl-ftp']
});
var joinPath = require('path').join;

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

// get the src glob array from config
// TODO: error handling
var srcPath = function(name) {
   var glob = config.paths[name]['src']; // could be an array of globs
   if (!Array.isArray(glob)) {
      glob = [glob];
   }
   return glob.map(function (el) {
      return joinPath(config.basePath, el);
   });
};
// get the dest path (string) from config (optionally appending and ext to the path)
var destPath = function(name, ext) {
   var path = config.paths[name]['dest']; // needs to be a string
   ext = ext || '';
   return joinPath(config.basePath, path, ext);
};

// console.log(srcPath('styles'));
// console.log(destPath('styles', '*'));
// process.exit();

gulp.task('upload', function() {
   var globs = srcPath('styles'); // sources (glob array)
   globs.push( destPath('styles', '*') ); // add everything in destination folder
   return gulp.src( globs, {base: config.basePath} )
      .pipe( $.cached() ) // only pass through changed files
      .pipe( $.ftp.dest(ftpConfig.remoteBase) ).on('end', function(argument) {
         // console.log("ALL UPLOADED");
      })
      // .pipe( $.ftp.newerOrDifferentSize(ftpConfig.remoteBase) )
      .pipe( $.browserSync.stream({ once: true }) )
      .pipe( $.size() );
});


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
 *  watch styles & scripts (with livereload via browsersync)
 */
gulp.task('serve', ['browsersync'], function() {
  // watch src files
  // event: {type:'changed'|'deleted'|'added', path:string}
  gulp.watch( config.paths.src, function(event) {
    // console.log(event);
    if (event.type == 'deleted') {
      // gulp.src( event.path, {base: config.basePath} )
      //   .pipe( $.cached() ) // only pass through changed files
      //   .pipe( $.ftp.dest(ftpConfig.remoteBase) )
      //   .pipe( $.browserSync.stream({ once: true }) )
      //   .pipe( $.size() );
      //   // browserSync.reload(event.path);
    } else {
      // upload
      gulp.src( event.path, {base: config.basePath} )
        .pipe( $.cached() ) // only pass through changed files
        .pipe( $.ftp.dest(ftpConfig.remoteBase) )
        .pipe( $.browserSync.stream({ once: true }) )
        .pipe( $.size() );
        // browserSync.reload(event.path);
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
   //    return joinPath(config.basePath, path);
   // });
   return gulp.src( config.src.path, {base: config.basePath, buffer: false} )
      .pipe( $.ftp.dest(ftpConfig.remoteBase) );
});



/**
 *  default task
 */
gulp.task('default', ['serve']);
