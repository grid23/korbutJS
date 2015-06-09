"use strict"

var _ = require("../utils")
var WINDOW = typeof window !== "undefined" ? window : {}

module.exports.setWindow = function(v){
    WINDOW = v
}

module.exports.getWindow = function(){
    return WINDOW
}

module.exports.requestAnimationFrame = function(fn){
    fn = _.native(WINDOW.requestAnimationFrame) ? WINDOW.requestAnimationFrame
                              : WINDOW.webkitRequestAnimationFrame || WINDOW.mozRequestAnimationFrame
                             || WINDOW.msRequestAnimationFrame || WINDOW.oRequestAnimationFrame
                             || function(fn){
                                    return setTimeout(function(){
                                        fn(Date.now())
                                    }, 4)
                                }

    return function(handler){ return fn(handler) }
}()

module.exports.cancelAnimationFrame = function(fn){
    fn = _.native(WINDOW.cancelAnimationFrame) ? WINDOW.cancelAnimationFrame
                             : WINDOW.webkitCancelAnimationFrame || WINDOW.mozCancelAnimationFrame
                            || WINDOW.msCancelAnimationFrame || WINDOW.oCancelAnimationFame
                            || function(id){ clearTimeout(id) }

    return function(id){ return fn(id) }
}()
