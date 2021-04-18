var gulp = require('gulp'),
gulpLoadPlugins = require('gulp-load-plugins'),
$ = gulpLoadPlugins()
let preprocess = require("gulp-preprocess");
let batchReplace = require('gulp-batch-replace');
let watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const del = require('del');
const file = './config/api.js';

//开发测试版本
gulp.task("development", function() {
    gulp
      .src([file])
      .pipe(preprocess({
        context:{
          NODE_ENV: process.env.NODE_ENV || "development"
        }
      }))
      .pipe($.uglify()) //压缩
      .pipe(gulp.dest("./dist/config"));
});

//生产版本
gulp.task("production", function() {
    gulp
      .src([file])
      .pipe(preprocess({
        context:{
          NODE_ENV: process.env.NODE_ENV || "production"
        }
      }))
      .pipe($.uglify()) //压缩
      .pipe(gulp.dest("./dist/config"));
});

const config = {
    //第三方代码
    vendor: [
        'vendor/jquery/jquery.js',
        'vendor/template/art-template-web.js',
        // 'vendor/jquery/jquery.validate.js',
        // 'vendor/swiper/swiper-2.7.6.js'
    ],
    vendor_css: [
        'vendor/swiper/swiper-2.7.6.css'
    ],

    //压缩配置
    uglify: {
        compress: {
            drop_console: true
        },
        ie8: true,
        output: {
            keep_quoted_props: true,
            quote_style: 3
        }
    }
}
// 合并第三方代码
gulp.task('vendorJs', () => {
    return gulp.src(config.vendor)
      .pipe($.concat('vendor.js')) //合并后的文件名
      .pipe($.plumber()) // 处理报错信息，不中断程序
      // .pipe($.babel())
      .pipe($.uglify(config.uglify))
      .pipe(gulp.dest('dist/vendor'))
    //   .pipe($.if(dev,gulp.dest('.tmp/scripts'),gulp.dest('dist/scripts')))
});
  
gulp.task('html', function () {
    return gulp.src(['*.html', 'htmlBlocks/*.html', '!modules/*.html','!node_modules/**/*.html'])
               .pipe($.fileInclude({
                    prefix: '@@',
                    basepath: './htmlBlocks/'
                }))
                // .pipe(batchReplace([{
                //     "http://www.songyanbin.com":"localhost"
                // }]))
                .pipe(gulp.dest('dist'))
                .pipe($.connect.reload());
})

// scss
function notify(err) {
    // prevent gulp process exit
    this.emit('end');
}
gulp.task("sass",function(){
    gulp.src(config.vendor_css)
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest('dist/vendor')) //连接第三方css

    return gulp.src('scss/**/*.scss')
               .pipe($.sass())
               .on('error', notify)
               .pipe($.minifyCss())
               .pipe(gulp.dest('dist/css'))
})

// js
gulp.task("buildJs",function(){
    return gulp.src("js/**/*.js")
                .pipe($.babel({
                    presets: ['es2015']
                }))
                .pipe($.uglify())
                .pipe(gulp.dest('dist/js'))
                .pipe($.connect.reload());
})
gulp.task("apiJs",function(){
    gulp
      .src([file])
      .pipe(preprocess({
        context:{
          NODE_ENV: process.env.NODE_ENV || "development"
        }
      }))
      .pipe($.uglify()) //压缩
      .pipe(gulp.dest("./dist/config"))
      .pipe($.connect.reload());
})

// images
gulp.task('images',function(){
    //return gulp.src('images/*.jpg').pipe(gulp.dest('dest/images')) // 匹配所有.jpg的图片
    return gulp.src('images/**/*')
               .pipe($.imagemin())
               .pipe(gulp.dest('dist/images')) // gulp.src('images/**/*') gulp.src('images/*/*'
})

// 监听文件变化
gulp.task('watch',function(){
    w('*.html',['html']);
    w('htmlBlocks/*.html',['html']);
    w('modules/*.html',['html']);
    w('scss/**/*.scss',['sass']);
    w('js/**/*.js',['buildJs','vendorJs']);
    w('config/*.js',['apiJs']);
    w('vendor/**/*.js',['images']);
    w('images/*.{jpg,png}',['images']);
    function w(path, task){
        $.watch(path, function () {
            gulp.start(task);
            browserSync.reload();
        });
    }
})
// gulp.task('server',function(){
//     $.connect.server({
//         root: './dist',
//         port: '8888',
//         open: true,
//         livereload: true //实时刷新开关
//     })
// })
// 解决第一次使用没反应报错（先打包在启动服务）
gulp.task('server', () => {
    runSequence('clean', 'build-start', () => {
        $.connect.server({
            root: './dist',
            host: '0.0.0.0',
            port: '8888',
            open: true,
            livereload: true //实时刷新开关
        })
    })
});

// 本地启动服务 gulp
gulp.task('default', () => {
    runSequence('clean', ['development', 'server','watch'])
}) // ['server','watch']

// 清除dist文件夹
gulp.task("clean",()=>{
    return del(["dist"])
})

// 整体打包 gulp build
gulp.task('build-start',['clean','html','sass','buildJs','images', 'vendorJs'],function(){
    console.info("gulp前端模板")
    console.warn("如有问题，请提issues帮忙完善")
    console.info("地址：https://github.com/xiaosongread/github-xiaosongread-hexo")
    console.log("打包完成！")
})
gulp.task('build', () => { // 先清除dist文件夹在整体打包
    runSequence("clean",["production","build-start"])
    // return new Promise(resolve => {
    //     runSequence(['clean'], 'build-start', resolve);
    // });
});

