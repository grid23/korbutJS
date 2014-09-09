"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Iterator = require("./Iterator").Iterator
var Stylesheet = require("./Stylesheet").Stylesheet

module.exports.Transition = klass(function(statics){
    var transitions = Object.create(null)
    var cssProperties = window.getComputedStyle(document.createElement("div"))

    Object.defineProperties(statics, {
        NONE: { enumerable: true, value: 0 }
      , STANDARD: { enumerable: true, value: 1 }
      , WEBKIT: { enumerable: true, value: 3 }
      , CSS_TRANSITION_COMPAT: { enumerable: true,
            value: "TransitionEvent" in window ? 1 : "WebKitTransitionEvent" in window ? 3 : 0
        }
      , CSS_TRANSITION_PROPERTY: { enumerable: true,
            value: "TransitionEvent" in window ? "transition" : "WebKitTransitionEvent" in window ? "-webkit-transition" : null
        }
      , CSS_TRANSITIONEND_EVENT: { enumerable: true,
            value: "TransitionEvent" in window ? "transitionend" : "WebKitTransitionEvent" in window ? "webkitTransitionEnd" : null
        }
      , stylesheet: { enumerable: true,
            value: new Stylesheet//({ uid: "korbut-transFX" })
        }
      , addHook: { enumerable: true,
            value: function(){

            }
        }
    })

    var hooks = Object.create(null)
    function hook(key, value){
        if ( _.typeof(hooks[key]) == "function" )
          return hooks[key](value)

        return {
            key: key
          , originalKey: key
          , value: value
        }
    }

    function filterCSSProperties(properties, filtered, cssText, rv, iterator){
        filtered = []
        cssText = []
        rv = {}
        iterator = new Iterator(properties)

        while ( !iterator.next().done )
          void function(key, value, hooked){
              hooked = hook(key, value)

          }( iterator.current.key, iterator.current.value )
    }

    return {
        constructor: function(node, properties, args){
            args = _.spread(arguments)
            properties = _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
            node = args[args.length-1] && args[args.length-1].nodeType == Node.ELEMENT_NODE ? args.pop() : document.createElement("div")

            transitions[this.uid] = Object.create(null, {
                instance: { value: this }
              , node: { value: node }
              , properties: { value: filterCSSProperties(properties) }
            })
        }

      , animate: { enumerable: true,
            value: function(){

            }
        }

      , CSS_TRANSITION_COMPAT: { enumerable: true,
            get: function(){ return module.exports.Transition.CSS_TRANSITION_COMPAT }
        }
      , CSS_TRANSITION_PROPERTY: { enumerable: true,
            get: function(){ return module.exports.Transition.CSS_TRANSITION_PROPERTY }
        }
      , CSS_TRANSITIONEND_EVENT: { enumerable: true,
            get: function(){ return module.exports.Transition.CSS_TRANSITIONEND_EVENT }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete transitions[this.uid].instance
            }
        }

    }
})
