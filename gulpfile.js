"use strict"

var gulp = require("gulp")

gulp.task("browserify", require("./tasks/browserify").browserify)
gulp.task("uglify", ["browserify"], require("./tasks/uglify").uglify)
gulp.task("release:save", ["uglify"], require("./tasks/release").save)
gulp.task("release:revision", ["uglify"], require("./tasks/release").revision)
gulp.task("release:minor", ["uglify"], require("./tasks/release").minor)
gulp.task("release:major", ["uglify"], require("./tasks/release").major)

gulp.task("karma:start", require("./tasks/karma").start)
gulp.task("karma:run", ["karma:start"], require("./tasks/karma").run)

gulp.task("default", ["release:save", "karma:start"], function(){
    gulp.watch("./src/*", ["release:save", "karma:run"])
    gulp.watch("./specs/*", ["karma:run"])
})
