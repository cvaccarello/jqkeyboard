const path = require('path');
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

const minifyJS = () => {
	// NOTE:  Build process is different if in production, b/c otherwise chrome (and likely other consoles) gets confused when trying to debug
	return gulp.src([ 'src/**/*.js' ])
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(concat('keyboard.min.js'))
		.pipe(uglify({ keep_fnames: true }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));
};

/******************************/
/****   Setup Gulp Tasks   ****/
/******************************/

// default task to watch and minify javascript files (also produces an optional map file to use)
gulp.task('default', function() {
	minifyJS();
	gulp.watch('src/**/*.js', minifyJS);
});

// task to manually build
gulp.task('build', async function() {
	minifyJS();
});
