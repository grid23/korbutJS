void function(karma, path){

    karma.server.start({
        basePath: ''
      , frameworks: ['mocha']
      , files: [
          './bower_components/chai/chai.js',
          './korbutt/korbut.js',
          './specs/**/*.js'
        ]
      , exclude: []
      , preprocessors: {}
      , reporters: ['progress']
      , port: 9876
      , colors: true
      , autoWatch: false
      , browsers: []
      , singleRun: false
    })

}( require("karma"), require("path") )
