import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-clean-css');
const minifyJS = require('gulp-uglify');
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';
const browserSync = require('browser-sync').create();

// Шляхи до вихідних файлів
const src = {
    js: 'src/js/main.js',
    sass: 'src/sass/style.sass',
    images: 'src/img/**/*',
    fonts: 'src/fonts/**/*',
    html: 'src/*.html', // Шлях до HTML файлів
};

// Шляхи до каталогів з готовими файлами
const dist = {
    js: 'dist/js',
    css: 'dist/css',
    images: 'dist/img',
    fonts: 'dist/fonts',
};

// Завдання для запуску сервера та синхронізації браузера
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: './' // Вказати кореневу теку сервера
        },
        port: 3000 // Вказати номер порту
    });
});

// Завдання для обробки стилів (Sass, Autoprefixer, зведення в один файл, мініфікація)
gulp.task('styles', function () {
    return gulp.src(src.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(concat('styles.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest(dist.css));
});

// Завдання для обробки JavaScript (зведення в один файл, мініфікація)
gulp.task('scripts', function () {
    return gulp.src(src.js)
        .pipe(concat('main.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest(dist.js));
});

// Завдання для обробки зображень
gulp.task('images', function () {
    return gulp.src(src.images)
        .pipe(imagemin()) // Оптимізувати зображення
        .pipe(gulp.dest(dist.images));
});

// Завдання для мініфікації версійного HTML
gulp.task('minify-html', function () {
    return gulp.src(src.html)
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest('./'));
});

// Запуск слідкування за змінами
gulp.task('watch', function () {
    gulp.watch(src.sass, gulp.series('styles')).on('change', browserSync.reload);
    gulp.watch(src.js, gulp.series('scripts')).on('change', browserSync.reload);
    gulp.watch(src.images, gulp.series('images')).on('change', browserSync.reload);
    gulp.watch(src.html, gulp.series('minify-html')).on('change', browserSync.reload);
    // Додайте інші слідкуючі завдання, якщо потрібно
});

// Завдання за замовчуванням
gulp.task('default', gulp.parallel('styles', 'scripts', 'images', 'browser-sync', 'watch'));

// Завдання для створення білда для продакшену
gulp.task('build', gulp.series('styles', 'scripts', 'images', 'minify-html'));
