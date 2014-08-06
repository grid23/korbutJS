void function(karma, path){

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

}( require("karma"), require("path") )
