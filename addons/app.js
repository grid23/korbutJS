"use strict"

const klass = require("../src/class").class

const Server = require("./Server").Server
const Watcher = require("./Watcher").Watcher
const Builder = require("./Builder").Builder

const TestBuilder = klass(Builder, {
    constructor: function(){
        Builder.apply(this, arguments)
    }
  , build: { enumerable: true,
        value: function(file, dir){
            console.log("build", file, dir)
        }
    }
})


const ZView = require("../src/ZView").ZView

let builder = new TestBuilder
let watcher = new Watcher

watcher.addEventListener("change", function(e){
    console.log(e.file, e.directory)
})

watcher.addEventListener("change", builder)

watcher.addEventListener("errror", function(e){
  console.log(e.error)
})

builder.build()

let server = new Server()
server.addRouteHandler("*", function(Route, next){
    Route.response.end("ok")
    return next(true)
})
server.listen(6666)
