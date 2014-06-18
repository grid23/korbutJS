void function(){
    "use strict"

    var _ = require("./utils")
    var singleton = require("./class").singleton

    module.exports.SInternalAnimationManager = singleton(function(statics){
        var PERFORMANCE_COMPAT = window.performance && _.native(window.performance.now)
        var queue = []

        var requestAnimationFrame = _.native(window.requestAnimationFrame) ? window.requestAnimationFrame
                                  : window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
                                 || window.msRequestAnimationFrame || window.oRequestAnimationFrame
                                 || function(fn){
                                        return setTimeout(function(){
                                            fn(Date.now())
                                        }, 4)
                                    }

        var cancelAnimationFrame = _.native(window.cancelAnimationFrame) ? window.cancelAnimationFrame
                                 : window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame
                                || window.msCancelAnimationFrame || window.oCancelAnimationFame
                                || function(id){ clearTimeout(id) }

        Object.defineProperties(statics, {
            now: { enumerable: true,
                value: function(){
                    return PERFORMANCE_COMPAT
                         ? function(){ return performance.now() }
                         : function(){ return Date.now() }
                }()
            }
          , requestAnimationFrame: { enumerable: true,
                value: function(fn){
                    return new module.exports.SInternalAnimationManager().queue(fn)
                }
            }
          , cancelAnimationFrame: { enumerable: true,
                value: function(id){
                    return new module.exports.SInternalAnimationManager().dequeue(id)
                }
            }
        })

        return {
            queue: { enumerable: true,
                value: function(fn){

                }
            }
          , dequeue: { enumerable: true,
                value: function(fn){

                }
            }

          , length: { enumerable: true,
                get: function(){ return queue.length }
            }
        }
    })
}()
