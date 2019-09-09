"use strict";

var gulp = require("gulp"),
    sass = require("gulp-sass"),
    plumber = require("gulp-plumber"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    concat = require('gulp-concat'),
    minify = require("gulp-csso"),
    terser = require("gulp-terser"),
    htmlmin = require("gulp-htmlmin"),
    rename = require("gulp-rename"),
    imagemin = require("gulp-imagemin"),
    posthtml = require("gulp-posthtml"),
    include = require("posthtml-include"),
    pug = require("gulp-pug"),
    del = require("del"),
		server = require("browser-sync").create();
		
gulp.task("style", function() {
  return gulp.src("source/sass/main.sass")
    .pipe(plumber())
    .pipe(sass({ 'include css': true }))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("main.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("terser", function() {
  return gulp.src([
    "source/libs/**/*.js",
    "source/js/*.js",
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(terser())
    .pipe(gulp.dest("build/js"))
});

gulp.task('pug', () => {
	return gulp.src('source/pug/pages/*.pug')
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest('build'))
});

gulp.task("htmlmin", function() {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

gulp.task('imgmin', () =>
  gulp.src('source/img/**/*')
	  .pipe(imagemin([imagemin.jpegtran({progressive: true}),
		imagemin.svgo(), imagemin.gifsicle()]))
	  .pipe(gulp.dest('build/img'))
);

gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*",
    "source/libs/**/*",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("build", gulp.series(
  "clean", 
  "copy", 
  "style", 
  "imgmin", 
  "pug", 
  "terser", 
  "htmlmin", 
));

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.parallel("style"));
  gulp.watch("source/*.html", gulp.parallel("html"));
  gulp.watch('source/pug/**/*.pug', gulp.parallel('pug'));
  gulp.watch("source/*.html").on("change", server.reload);
});
