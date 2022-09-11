const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const fonterUnx = require('gulp-fonter-unx');
const ttf2woff2 = require('gulp-ttf2woff2');
const webp = require('gulp-webp');
const webpCss = require('gulp-webp-css');
const webpHtml = require('gulp-webp-html');
const htmlmin = require('gulp-htmlmin');
const newer = require('gulp-newer');
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const shorthand = require('gulp-shorthand');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    })
};

function html () {
    return src ('app/*.html')
    .pipe(webpHtml())
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(dest('dist/'))
    .pipe(browserSync.stream())
};


function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        //.pipe(webpCss())
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(groupCssMediaQueries())
        .pipe(shorthand())
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
};

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
};

function fonts() {
    return src('app/fontsAll/*.*')
    .pipe(newer('app/fonts/*.*'))
    .pipe(fonterUnx({
        formats: ["ttf", "woff", "eot", "svg"]
    }))
    .pipe(ttf2woff2())
    .pipe(newer('app/fonts/*.*'))
    .pipe(dest('app/fonts'))
};

function images() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
        .pipe(webp())
        .pipe(dest('dist/images'))
        .pipe(browserSync.stream())
};

function cleanDist() {
    return del("dist");
};

function build() {
    return src(
        [
            "app/css/style.min.css",
            "app/fonts/**/*",
            "app/js/main.min.js",
            
        ],
        { base: "app" }
    ).pipe(dest("dist"));
};

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/images/*.*']).on('change', browserSync.reload);
    watch(['app/*.html']).on('change', browserSync.reload);
};

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.fonts = fonts;
exports.html = html;

exports.build = series(cleanDist,html, images, build);

exports.default = parallel(styles, scripts, browsersync, watching);  //fonts