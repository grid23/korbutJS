"use strict"

var browserify = require("browserify")
var fs = require("fs")
var path = require("path")
var q = require("q")
var main, dest

main = path.join(__dirname, "../src/index.js")
dest = path.join(__dirname, "../dist/korbut.js")

module.exports.browserify = function(dfd){
    dfd = q.defer()

    browserify(main).bundle(function(err, buffer){
        if ( err )
          return dfd.reject(err)

        fs.exists(path.dirname(dest), function onexists(exists){
            if ( !exists )
              fs.mkdir(path.dirname(dest), function(err){
                  if ( err )
                    return dfd.reject(err)

                  onexists(true)
              })

            fs.writeFile(dest, buffer, "utf8", function(err){
                if ( err )
                  return dfd.reject(err)

                dfd.resolve()
            })
        })
    })

    return dfd.promise
}
