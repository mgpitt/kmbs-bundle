// Include Gulp
var gulp = require('gulp');
var Config = require('./gulp.config.js');
var isWatching = false;

// Include plugins
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});

gulp.task('default', ['index']);

gulp.task('index', ['vendors', 'styles', 'templates', 'scripts'], function() {
  return gulp.src(Config.INDEX_FILE)
    // Inject bower files.
    .pipe(plugins.inject(
      gulp.src([Config.VENDOR_DESTINATION + '/**/*.{js,css}']),
      {
        addRootSlash: false,
        addPrefix: '${bundle.location}',
        starttag: '<!-- inject:vendor:{{ext}} -->'
      }
    ))
    // Inject application files.
    .pipe(plugins.inject(
      gulp.src(['./dist/app/**/*.js'])
        .pipe(plugins.angularFilesort()),
      {
        addRootSlash: false,
        addPrefix: '${bundle.location}',
        starttag: '<!-- inject:{{ext}} -->'
      }
    ))
    .pipe(plugins.inject(
      gulp.src(['./dist/css/**/*.css']),
      {
        addRootSlash: false,
        addPrefix: '${bundle.location}',
        starttag: '<!-- inject:{{ext}} -->'
      }
    ))
    .pipe(gulp.dest(Config.INDEX_DESTINATION))
    .pipe(plugins.livereload());
});

function livereload() {
  return (isWatching ? plugins.livereload() : plugins.util.noop());
}

// function index () {
//   var opt = {read: false};
//   return gulp.src('./src/app/index.html')
//     .pipe(g.inject(gulp.src(bowerFiles(), opt), {ignorePath: 'thirdparty', addRootSlash: false, starttag: '<!-- inject:vendor:{{ext}} -->'}))
//     .pipe(g.inject(es.merge(appFiles(), cssFiles(opt)), {ignorePath: ['.tmp', 'src/app'], addRootSlash: false}))
//     .pipe(gulp.dest('./src/app/'))
//     .pipe(g.embedlr())
//     .pipe(gulp.dest('./.tmp/'))
//     .pipe(livereload());
// }

gulp.task('watch', ['index'], function () {
  isWatching = true;
  // Initiate livereload server:
  plugins.livereload.listen();
  // gulp.watch(Config.APPLICATION_SRC, ['jshint']).on('change', function (evt) {
  //   if (evt.type !== 'changed') {
  //     gulp.start('index');
  //   } else {
  //     plugins.livereload.changed(evt);
  //   }
  // });
  gulp.watch('./app/kapp.jsp', ['index']);
  gulp.watch(Config.JADE_SRC, ['index']);
  gulp.watch(Config.TEMPLATE_SRC, ['index']);
  gulp.watch(Config.SASS_ALL_SRC, ['index']);
  gulp.watch(Config.APP_SRC, ['index']);
  // gulp.watch(['./src/app/**/*.scss'], ['csslint']).on('change', function (evt) {
  //   if (evt.type !== 'changed') {
  //     gulp.start('index');
  //   } else {
  //     g.livereload.changed(evt);
  //   }
  // });

});

gulp.task('jade', function() {
  return gulp.src('./app/**/*.jade')
    .pipe(plugins.jade({
      pretty: true
    }))
    .pipe(gulp.dest(Config.TEMP))
    //.pipe(plugins.livereload());
});

gulp.task('templates', ['jade'], function() {
  return templateFiles()
    .pipe(plugins.ngHtml2js({
      moduleName: Config.MODULE_NAME,
      declareModule: false,
      stripPrefix: '/src/app'
    }))
    .pipe(plugins.concat('bundle-templates.js'))
    .pipe(gulp.dest(Config.APP_DESTINATION))
    //.pipe(plugins.livereload());
});

gulp.task('styles', ['fonts'], function () {
  return gulp.src(Config.SASS_SRC)
    .pipe(plugins.sass())
    .pipe(gulp.dest(Config.CSS_DESTINATION));
});

gulp.task('fonts', function() {
  return gulp.src(Config.FONTS_SRC)
    .pipe(gulp.dest(Config.CSS_DESTINATION + '/font'));
});

gulp.task('scripts', function() {
  return appFiles()
    .pipe(plugins.ngAnnotate())
    .pipe(gulp.dest(Config.APP_DESTINATION));
});

gulp.task('vendors', ['vendor-scripts', 'vendor-styles']);

gulp.task('vendor-scripts', function() {
    return bowerFiles()
        .pipe(plugins.filter('**/*.js', { restore: true }))
        .pipe(plugins.concat('vendors.js'))
        .pipe(gulp.dest(Config.VENDOR_DESTINATION));
});

gulp.task('vendor-styles', function() {
    bowerFiles()
        .pipe(plugins.filter('**/*.css'))
        .pipe(plugins.concat('vendors.css'))
        .pipe(gulp.dest(Config.VENDOR_DESTINATION));
});

function appFiles() {
  return gulp.src(Config.APP_SRC)
    .pipe(plugins.angularFilesort());
}

function bowerFiles() {
  return gulp.src('./bower.json')
      .pipe(plugins.mainBowerFiles({}));
}

function templateFiles() {
  return gulp.src(Config.TEMPLATE_SRC);
}

function dist (ext, name, opt) {
  opt = opt || {};
  var uglifyOptions = {
    mangle: false,
    output: {
      beautify: {
        quote_style: 3
      },
      ascii_only: true
    }
  };
  return lazypipe()
    .pipe(g.concat, name + '.' + ext)
    .pipe(gulp.dest, (ext === 'css' ? DIST_DESTINATION + '/css' : DIST_DESTINATION))
    .pipe(opt.ngAnnotate ? g.ngAnnotate : noop)
    .pipe(opt.ngAnnotate ? g.rename : noop, name + '.annotated.' + ext)
    .pipe(opt.ngAnnotate ? gulp.dest : noop, DIST_DESTINATION)
    .pipe(ext === 'js' ? g.uglify : g.cssnano, ext === 'js' ? uglifyOptions : {})
    .pipe(g.rename, name + '.min.' + ext)
    .pipe(gulp.dest, DIST_DESTINATION + (ext === 'css' ? '/css' : ''))();
}
