'use strict';

var gulp = require('gulp'),
    debug = require('gulp-debug'),
    inject = require('gulp-inject'),
    tsc = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    del = require('del'),
    config = require('./Gulpfile.config.json'),
    tsProject = tsc.createProject('tsconfig.json'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    gulpIgnore = require('gulp-ignore');

var tsProject = tsc.createProject('tsconfig.json');

/**
 * Delete all of the *.js files from Resources.  If any *.js files
 * need to be stored, place them instead into src/Resources and they
 * will get copied over.
 */
gulp.task('clean', function (cb) {
    cb();
    // del(['Resources/**/*.js'], cb);
});

/**
 * Generate the vendor.js file based upon the requires contained within the
 * vendor_stub.js stub located in the root of the project
 */
//gulp.task('atomify', ['copy-files'], doAtomify);
gulp.task('atomify', ['clean'], doAtomify);
gulp.task('atomify-watch', doAtomify);

/**
 * Copy all of the non typescript files from src into the build directory.
 * if there are any *.js files needed, make sure they are in the src directory
 * or else they will get deleted by the clean step.
 */
gulp.task('copy-files', ['clean'], function () {
     //return gulp.src(['./src/Resources/**', '!**/*.ts'], {
             //base: './'
         //})
         //.pipe(gulp.dest('./'));
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task('lint', function () {
    var filter = function(file) {
        return !file.match(/d\.ts$/i);
    };
    return tsProject.src()
        .pipe(gulpIgnore.exclude('*.d.ts'))
        .pipe(tslint())
        .pipe(tslint.report('prose'));
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(tsc(tsProject));

    return tsResult.js.pipe(gulp.dest(tsProject.options.outDir || '.'));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
    var typeScriptGenFiles = [
        tsProject.options.outDir + '/**/*.js', // path to all JS files auto gen'd by editor
        '!' + tsProject.options.outDir + '/lib'
    ];

    // delete the files
    del(typeScriptGenFiles, cb);
});

gulp.task('watch', function () {
    gulp.watch(tsProject.options.files, ['lint', 'compile-ts']);
    //gulp.watch(config.stubVendorFile, ['atomify-watch']);
});

gulp.task('default', ['clean', 'lint', 'compile-ts', 'atomify', 'transform-spritesheets']);

// --------------------------------------------------------------------

/**
 * Post-processes the spritesheet
 * This is necessary because the spritesheets exported from Leshy Spritesheet Tool (http://www.leshylabs.com/apps/sstool/) are not formatted in a way that
 * Atomic Game Engine can read... the casing is wrong.
 */
gulp.task('transform-spritesheets', ['copy-files'], function () {
    return gulp.src(['./SourceAssets/Sprites/*.xml'], {
            base: './SourceAssets/Sprites'
        })
        .pipe(replace(/textureatlas/ig, 'TextureAtlas'))
        .pipe(replace(/subtexture/ig, 'SubTexture'))
        .pipe(replace(/imagepath/ig, 'imagePath'))
        .pipe(gulp.dest('./Resources/Sprites'));
});

function doAtomify() {

        var b = browserify({
            entries: './vendor_stub.js',
            ignoreMissing: false
        });

        return b.bundle()
            .pipe(source('vendor_stub.js'))
            .pipe(buffer())
            .pipe(rename('vendor.js'))
            .pipe(gulp.dest('./Resources/Modules'));
}

function doAtomifyExpiremental() {
  if (config.vendorModules && config.vendorModules.length > 0) {
    for (var i = 0; i < config.vendorModules.length; i++ ) {
      var b = browserify({
        ignoreMissing: false
      });

      //b.add(require(config.vendorModules[i]));
      b.add(config.vendorModules[i]);
      console.log(config.vendorModules[i]);
      //b.require(config.vendorModules);
      //b.ignore('Atomic');
      return b.bundle()
       .pipe(buffer())
       .pipe(gulp.dest('./Resources/Modules'));
    }
  }
}
