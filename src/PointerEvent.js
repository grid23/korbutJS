"use strict"

var _ = require("./utils")
var klass = require("./class").class

module.exports.PointerEvent = klass(function(statics){

    Object.defineProperties(statics, {
        CUSTOM_EVENTS_COMPAT: { enumerable: true,
            value: function(rv, tests, i, l){
                tests = [
                    function(){ new CustomEvent("ce", { bubbles: false, cancelable: false }, { detail: {} }); return 0x4 }
                  , function(){ document.createEvent("customEvent").initCustomEvent("ce", false, false, {}); return 0x2 }
                  , function(){ document.createEvent("Event").initEvent("ce", false, false); return 0x1 }
                ]

                for ( i = 0, l = tests.length; i < l; i++ )
                  try {
                      rv = tests[i].call()
                      return rv
                  } catch(e){ }

                return 0
            }()
        }
    })

    return {
        constructor: function(){

        }

      , CUSTOM_EVENTS_COMPAT: { enumerable: true,
            get: function(){
                return module.exports.PointerEvent.CUSTOM_EVENTS_COMPAT
            }
        }
    }
})
