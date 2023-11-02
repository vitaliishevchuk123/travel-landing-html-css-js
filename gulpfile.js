import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const gulp = require('gulp');
import rev from 'gulp-rev';
const revReplace = require('gulp-rev-replace');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-clean-css');
const minifyJS = require('gulp-uglify');
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';

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

// Створення хешів для файлів
gulp.task('hash', function () {
    return gulp.src(['dist/**/*.{css,js}']) // Виберіть файли, для яких потрібно створити хеші
        .pipe(rev()) // Генерувати унікальний хеш для файлів
        .pipe(gulp.dest('dist')) // Зберегти файли з хешами в той же каталог
        .pipe(rev.manifest()) // Створити файл мапування хешів
        .pipe(gulp.dest('dist')); // Зберегти файл мапування в каталозі
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


gulp.task('update-references', function () {
    const manifest = gulp.src('dist/rev-manifest.json');

    return gulp.src('src/index.html') // Змініть шлях до вашого HTML-файлу
        .pipe(revReplace({ manifest: manifest }))
        .pipe(gulp.dest('./')); // Зберегти оновлений HTML з підставою хешів
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

// Запуск слідкування за змінами
gulp.task('watch', function () {
    gulp.watch(src.sass, gulp.series('styles'));
    gulp.watch(src.js, gulp.series('scripts'));
    gulp.watch(src.images, gulp.series('images'));
    // Додайте інші слідкуючі завдання, якщо потрібно
});

// Завдання для мініфікації HTML
gulp.task('minify-html', function () {
    return gulp.src(src.html)
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true })) // Опції для мініфікації
        .pipe(gulp.dest('./')); // Зберегти мініфіковані HTML файли в корені сайту
});

// Завдання за замовчуванням
gulp.task('default', gulp.series('styles', 'scripts', 'images', 'watch'));

// Завдання для створення білда для продакшену
gulp.task('build', gulp.series('styles', 'scripts', 'images', 'hash', 'update-references', 'minify-html'));
