const project_folder = "dist";
const source_folder = "#src";
const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: source_folder + "/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
  },
  clean: "./" + project_folder + "/",
};

const { src, dest, watch, series, parallel } = require("gulp");
// const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const fileInclude = require("gulp-file-include"); //собираем разные html файлы в один
const browsersync = require("browser-sync").create();
const del = require("del");
const scss = require("gulp-sass")(require("sass"));
//группирует все меди-запросы в один в конце файла
const media = require("gulp-group-css-media-queries");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");

const webpHtml = require("gulp-webp-html"); //добавляет html код для webp изображений поверх обычного обьявления картинки через img (оборачивает в тег picture и добавляет source)
const uglify = require("gulp-uglify-es").default;

const svgsprite = require("gulp-svg-sprite");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
// const concatCss = require('gulp-concat-css'); // почему-то не конектится с sourcemaps!!!
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const newer = require("gulp-newer"); //не сжимать уже сжатые картинки (выбирается итоговая папка)
// const fonter = require("gulp-fonter"); //для преобразования шрифтов в другие форматы  Target formats for fonts. Possible: ["ttf", "otf", "eot", "woff", "svg"]

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/",
    },
    port: 3000,
    notify: true,
  });
}

function html() {
  return (
    src(path.src.html)
      .pipe(fileInclude())
      // .pipe(webpHtml())
      .pipe(dest(path.build.html))
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(
        rename({
          extname: ".min.html",
        })
      )
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream())
  );
}

function clear() {
  return del(path.clean);
}

function css() {
  return (
    src("#src/scss/**/*.scss", { sourcemaps: true })
      .pipe(scss())

      .pipe(dest(path.build.css))
      .pipe(media())
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 5 versions"],
          cascade: true,
        })
      )
      .pipe(dest(path.build.css))

      .pipe(concat("main.min.css"))
      .pipe(clean_css())
      // .pipe(dest(path.build.css, {sourcemaps:"."}))
      .pipe(dest("dist/css", { sourcemaps: "." }))
      .pipe(browsersync.stream())
  );
}

function js() {
  return src(path.src.js, { sourcemaps: true })
    .pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js, { sourcemaps: true }))
    .pipe(browsersync.stream());
}
/*
function fonts(){
  src(path.src.fonts)
  .pipe(ttf2woff())
  .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
  .pipe(ttf2woff2())
  .pipe(dest(path.build.fonts));
}
 */
// работаем с папкой исходником!!
// не подключена и не протестирована!!!!!
/* function otf2ttf(){
  return src([source_folder + "/fonts/*.otf"])
  .pipe(fonter({
    formats: ["ttf"]
  }))
  .pipe(dest(source_folder + "/fonts/"));
  
} */

// проблема с перебросом и обработкой webp не решена!
// imagemin не работает с форматом webp!!!
function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(newer(path.build.img))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 4 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

// эту задачу вызывать отдельно!
// она не включена в сборку по-умолчанию
/* function svgSprite(){
  return src([source_folder + "/iconsprite/*.svg"])
    .pipe(svgsprite({
      mode: {
        stack: {
          sprite: "../icons/icons.svg",
          example: true
        }
      }
    }))
    .pipe(dest(path.build.img));
} */

function watchFies() {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
  watch([path.watch.img], images);
}
// let build = series(clear, html);
// let watching = series(build, parallel( watchFies, browserSync));

// exports.svgSprite = svgSprite;
// let build = series(clear, parallel(js, css, html, images, fonts ));
// let watching = series(build, parallel( watchFies, browserSync));
let build = series(clear, parallel(css, html, js, images));
let watching = series(build, parallel(watchFies, browserSync));
exports.default = watching;

// function html() {
//   return src().pipe().pipe(dest());
// }

// exports.default = defaultTask;
