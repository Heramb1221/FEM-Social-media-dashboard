// Initialize modules
const { src, dest, watch, series } = require('gulp');   // Gulp functions for task management
const sass = require('gulp-sass')(require('sass'));     // Compile SCSS to CSS using dart-sass
const postcss = require('gulp-postcss');                // Apply PostCSS plugins
const autoprefixer = require('autoprefixer');           // Add vendor prefixes for cross-browser compatibility
const cssnano = require('cssnano');                     // Minify CSS
const babel = require('gulp-babel');                    // Transpile modern JS to older versions for compatibility
const terser = require('gulp-terser');                  // Minify JS
const browsersync = require('browser-sync').create();   // Live browser reloading

// Use dart-sass for @use syntax compatibility
//sass.compiler = require('dart-sass');

// Sass Task: Compile SCSS, apply PostCSS plugins (autoprefixer & cssnano), and output sourcemaps
function scssTask() {
  return src('app/scss/style.scss', { sourcemaps: true }) // Return the stream
    .pipe(sass().on('error', sass.logError)) // Log errors but don't crash the task
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest('dist', { sourcemaps: '.' }));
}


// JavaScript Task: Transpile JS using Babel, minify it using terser, and output sourcemaps
function jsTask() {
  return src('app/js/script.js', { sourcemaps: true })
    .pipe(babel({ presets: ['@babel/preset-env'] }))    // Transpile JS to ES5
    .pipe(terser())                                     // Minify JS
    .pipe(dest('dist', { sourcemaps: '.' }));           // Output compiled JS with sourcemaps
}

// Browsersync Serve: Start a local development server
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: '.',                                     // Serve files from the project root
    },
    notify: {                                           // Position the browser reload notification
      styles: {
        top: 'auto',
        bottom: '0',
      },
    },
  });
  cb();
}

// Browsersync Reload: Reload the browser
function browserSyncReload(cb) {
  browsersync.reload();                                 // Reload the browser
  cb();
}

// Watch Task: Watch files for changes and run corresponding tasks
function watchTask() {
  watch('*.html', browserSyncReload);                   // Watch HTML files and reload browser on changes
  watch(
    ['app/scss/**/*.scss', 'app/**/*.js'],              // Watch SCSS & JS files
    series(scssTask, jsTask, browserSyncReload)         // Re-run tasks and reload browser on changes
  );
}

// Default Gulp Task: Runs tasks in series for development workflow
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask);

// Build Gulp Task: Runs tasks in series for building production files
exports.build = series(scssTask, jsTask);               // Compile SCSS & JS without watching or live reloading
