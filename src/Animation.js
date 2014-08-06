void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Stylesheet = require("./Stylesheet").Stylesheet

    module.exports.requestAnimationFrame = function(fn){
        fn = _.native(window.requestAnimationFrame) ? window.requestAnimationFrame
                                  : window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
                                 || window.msRequestAnimationFrame || window.oRequestAnimationFrame
                                 || function(fn){
                                        return setTimeout(function(){
                                            fn(Date.now())
                                        }, 4)
                                    }

        return function(handler){ return fn(handler) }
    }()

    module.exports.cancelAnimationFrame = function(fn){
        fn = _.native(window.cancelAnimationFrame) ? window.cancelAnimationFrame
                                 : window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame
                                || window.msCancelAnimationFrame || window.oCancelAnimationFame
                                || function(id){ clearTimeout(id) }

        return function(id){ return fn(id) }
    }()

    module.exports.Animation = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()
