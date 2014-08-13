"use strict"

var karma = require("karma")
var path = require("path")
var child_process = require("child_process")
var q = require("q")
var child


process.on("exit", kill)

module.exports.start = function(dfd){
    dfd = q.defer()

    if ( child )
      kill()

    child = child_process.spawn("node", [
        path.join(__dirname, "karma-background.js")
    ])

    child.stdout.on("data", function(data){
        process.stdout.write(data)
    })



    setTimeout(function(){
        dfd.resolve()
    }, 2500)


    return dfd.promise
}

module.exports.run = function(dfd, runner){
    dfd = q.defer()

    karma.runner.run({port: 9876}, function(){
        dfd.resolve()
    })

    return dfd.promise
}

function kill(){
    if ( !child )
      return

    child_process.exec("kill -9 "+child.pid, function(){
        console.log("karma server killed!")
    })
    child = null
}
