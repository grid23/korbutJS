"use strict"

var karma = require("karma")
var path = require("path")

karma.server.start({
    basePath: ''
  , frameworks: ["mocha", "chai"]
  , files: [ "./dist/korbut.js", "./specs/**/*.js" ]
  , exclude: []
  , preprocessors: {}
  , reporters: ['progress']
  , port: 9876
  , colors: true
  , autoWatch: false
  , browsers: []
  , singleRun: false
  , logLevel: "ERROR"
})
