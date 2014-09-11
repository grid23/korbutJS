"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID
var Iterator = require("./Iterator").Iterator
var Stylesheet = require("./Stylesheet").Stylesheet
var CSSRule = require("./Stylesheet").CSSRule

var cssProperties = window.getComputedStyle(document.createElement("div"))

module.exports.CSSHook = klass(function(statics){
    var hooks = Object.create(null)

    Object.defineProperties(statics, {
        testProperty: { enumerable: true,
            value: function(property, value){
                return hooks[property] && hooks[property].instance.test(value)
            }
        }
      , getByProperty: { enumerable: true,
            value: function(property){
                return hooks[property].instance
            }
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return hooks[uid].intance
            }
        }
    })

    return {
        constructor: function(property, handler, args){
            args = _.spread(arguments)
            handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : function(property, value){ return { property: property, value: value } }
            property = _.typeof(args[args.length-1]) == "string" ? args.pop() : Object.prototype.toString.call(args.pop())

            hooks[this.uid] = hooks[property] = Object.create(null, {
                instance: { value: this }
              , property: { value: property }
              , handler: { value: handler }
            })
        }
      , test: { enumerable: true,
            value: function(value, hooked){
                value = _.typeof(value) == "string" ? value : Object.prototype.toString.call(value)

                hooked = hooks[this.uid].handler(value)
                hooked = _.typeof(hooked) == "object" && hooked.hasOwnProperty("value") ? hooked
                       : _.typeof(hooked) == "string" ? { value: hooked }
                       : { value: value }

                hooked.property = hooked.property || this.property
                hooked.originalProperty = hooked.originalProperty || this.property

                return hooked
            }
        }

      , property: { enumerable: true,
            get: function(){
                return hooks[this.uid].property
            }
        }
      , handler: { enumerable: true,
            get: function(){
                return hooks[this.uid].handler
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete hooks[this.uid].instance
            }
        }
    }
})

new module.exports.CSSHook("transform", function(prop){
    if ( cssProperties.getPropertyValue("transform") != void 0 )
      return function(value){
          return { property: "transform", value: value }
      }
    else
      return function(value){
          return { property: "-webkit-transform", value: value }
      }
}())

module.exports.Transition = klass(function(statics){
    var transitions = Object.create(null)

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
            value: new Stylesheet({ uid: "korbut-transFX" })
        }
    })

    function filterCSSProperties(properties, filtered, cssText, rv, iterator){
        filtered = []
        cssText = []
        rv = {}
        iterator = new Iterator(properties)

        while ( !iterator.next().done )
          void function(key, value, hooked){

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
