'use strict';

const gulp = require('gulp');
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const autoprefixer = require('autoprefixer');
const changed = require('gulp-changed');
const postcss = require('gulp-postcss')
const minifyCss = require('gulp-clean-css')
const rename = require('gulp-rename')
const flexbugs = require('postcss-flexbugs-fixes')
const cssvariables = require('postcss-css-variables')
const sass = require('gulp-sass');
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('gulp-buffer')
const size = require('gulp-size')
const util = require('gulp-util')
const sourcemaps = require('gulp-sourcemaps')
const gulpif = require('gulp-if')
const browsersync = require( 'browser-sync' ).create();
const yaml = require('js-yaml')

// Project GulpConfig
let gulpConfig = fs.readFileSync(path.resolve(__dirname, '.groundcontrolrc'), 'UTF-8')
const gulpVars = JSON.parse(gulpConfig).vars

_.forEach(gulpVars, function (value, key) { // eslint-disable-line unicorn/no-fn-reference-in-iterator
  gulpConfig = gulpConfig.replace(new RegExp('\<\=\s*' + key + '\s*\>', 'ig'), value)
})

gulpConfig = JSON.parse(gulpConfig)

const themeConfig = yaml.load(fs.readFileSync(path.resolve(__dirname, 'config.yml'), 'UTF-8'))

var errorLogger, headerLines

errorLogger = function (error) {
  var title = 'Compile Error'
  var header = headerLines(title)
  header += '\n             ' + title + '\n           '
  header += headerLines(title)
  header += '\n           ' + error.message + '\n         '
  header += '\r\n \r\n'
  util.log(util.colors.red(header) + '             ' + error.stack + '\r\n')

  if (showErrorNotifications) {
    notifier.notify({
      title: 'Compile Error',
      message: error.message,
      contentImage: __dirname + '/gulp_error.png'
    })
  }
}

headerLines = function (message) {
  var lines = ''
  for (var i = 0; i < (message.length + 4); i++) {
    lines += '-'
  }
  return lines
}

const isProd = function(){
  if(process.env.ENVIRONMENT === 'prod'){
    return true
  } else {
    return false
  }
}

const isDev = function(){
  if(process.env.ENVIRONMENT === 'dev'){
    return true
  } else {
    return false
  }
}

gulp.task('sass', () => {
  return gulp.src(gulpConfig.sass.theme)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([flexbugs, cssvariables, autoprefixer(gulpConfig.autoprefixer)]))
    .pipe(minifyCss())
    .pipe(rename(function (path) {
        path.basename += '.min'
    }))
    .pipe(gulp.dest(gulpConfig.dist.assets))
    .pipe(gulpif(isProd, size({title: 'css'})))
});

gulp.task('critical', () => {
  return gulp.src(gulpConfig.sass.critical)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([flexbugs, cssvariables, autoprefixer(gulpConfig.autoprefixer)]))
    .pipe(minifyCss())
    .pipe(rename(function (path) {
      return {
        dirname: path.dirname,
        basename: path.basename,
        extname: ".liquid"
      };
        path.basename += '.liquid'
    }))
    .pipe(gulp.dest(gulpConfig.snippets))
    .pipe(gulpif(isProd, size({title: 'css'})))
});

gulp.task('js', () => {
  let bundler = browserify(gulpConfig.js.theme)

  if(isDev){
    bundler.plugin('errorify') // For dev js
  }

  if(isProd){
    bundler.transform('uglifyify', { global: true }) // Prod js
  }

  return bundler.transform('babelify')
    .bundle()
    .on('error', errorLogger)
    .pipe(source('theme.js'))
    .pipe(buffer())
    .pipe(rename(function (path) {
      path.basename += '.min'
    }))
    .pipe(gulpif(isDev, sourcemaps.init({ loadMaps: true })))
    .pipe(gulpif(isDev, sourcemaps.write('./')))
    .pipe(gulp.dest(gulpConfig.dist.assets))
    .pipe(gulpif(isProd,size({title: 'js'})))
});

gulp.task('browsersync', (done) => {
  browsersync.init({
    injectChanges: true,
    port: '3000', ui: { port: '3000' + 1 },
    proxy: 'https://' + themeConfig.development.url,
    notify: true,
    startPath: "/?preview_theme_id=" + themeConfig.development.theme_id,
    files: './theme_ready',
    reloadDelay: 1000, // Sometimes browsersync is marginally too quick for Shopify
    snippetOptions: {
      blacklist: ['/preview_bar'],
      rule: {
          match: /<\/body>/i,
          fn: function (snippet, match) {
              return snippet + match;
        }
      }
    }
  }, done);
});

gulp.task('watch', () => {
  gulp.watch(gulpConfig.sass.all, gulp.series('sass'));
  gulp.watch(gulpConfig.sass.all, gulp.series('critical'));
  gulp.watch(gulpConfig.js.all, gulp.series('js'));
});

gulp.task('build', gulp.series('critical', 'sass', 'js'));

gulp.task('default', gulp.parallel(gulp.series('critical', 'sass', 'js'), 'browsersync', 'watch'));
