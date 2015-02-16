"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID
var Iterator = require("./Iterator").Iterator
var Stylesheet = require("./Stylesheet").Stylesheet
var CSSRule = require("./Stylesheet").CSSRule
var domReady = require("./domReady")
var requestAnimationFrame = require("./dom-utils/requestAnimationFrame").requestAnimationFrame
var Promise = require("./Promise").Promise
var cssProperties = window.getComputedStyle(document.createElement("div"))

module.exports.Animation = klass(function(statics){
    var animations = Object.create(null)

    Object.defineProperties(statics, {
        NONE: { enumerable: true, value: 0 }
      , STANDARD: { enumerable: true, value: 1 }
      , WEBKIT: { enumerable: true, value: 1 }
      , CSS_ANIMATION_COMPAT: { enumerable: true,
            value: "AnimationEvent" in window ? 1 : "WebKitAnimationEvent" in window ? 3 : 0
        }
      , CSS_ANIMATION_PROPERTY: { enumerable: true,
            value: "AnimationEvent" in window ? "animation" : "WebKitAnimationEvent" in window ? "-webkit-animation" : null
        }
      , CSS_ANIMATIONEND_EVENT: { enumerable: true,
            value: "AnimationEvent" in window ? "animationend" : "WebKitAnimationEvent" in window ? "webkitAnimationEnd" : null
        }
      , stylesheet: { enumerable: true,
            value: new Stylesheet({ uid: "korbut-animFX" })
        }
      , CUSTOM_DATA: { enumerable: true,
            value: "data-k-animFX-ID"
        }
      , CLASSLIST_COMPAT: {
            value: Element.prototype.hasOwnProperty("classList")
        }
      , animate: { enumerable: true,
            value: function(){

            }
        }
    })

    function createCSSRule(){

    }

    return {
        constructor: function(node, properties, keyframes, args){
            args = _.spread(arguments)
            keyframes = _.typeof(args[args.length-1]) == "array" && args[args.length-1].length > 1 ? args.pop() : [{}, {}]
            _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
            node = args[args.length-1] && args[args.length-1].nodeType == Node.ELEMENT_NODE ? args.pop() : document.createElement("div")

            if ( _.typeof(properties.classname) == "string" )
              exists = true,
              created = {
                  propsToAnimate: _.typeof(properties.properties) == "array" ? properties.properties : []
                , classname: properties.classname
                , cssRule: null
              }
            else
              created = createCSSRule(this.uid, properties)

            animations[this.uid] = Object.create(null, {
                instance: { value: this }
              , node: { value: node }
              , cssRule: { value: null }
              , keyframes: { value }
            })

            if ( !exists )
              this.stylesheet.insertRule(transitions[this.uid].cssRule)
        }
      , animate: { enumerable: true,
            value: function(){

            }
        }
      , node: { enumerable: true,
            get: function(){
                return transitions[this.uid].node
            }
        }

      , CSS_ANIMATION_COMPAT: { enumerable: true,
            get: function(){ return module.exports.Animation.CSS_ANIMATION_COMPAT }
        }
      , CSS_ANIMATION_PROPERTY: { enumerable: true,
            get: function(){ return module.exports.Animation.CSS_ANIMATION_PROPERTY }
        }
      , CSS_ANIMATIONEND_EVENT: { enumerable: true,
            get: function(){ return module.exports.Animation.CSS_ANIMATIONEND_EVENT }
        }

      , CUSTOM_DATA: { enumerable: true,
            get: function(){ return module.exports.Animation.CUSTOM_DATA }
        }
      , CLASSLIST_COMPAT: { enumerable: true,
            get: function(){ return module.exports.Animation.CLASSLIST_COMPAT }
        }
      , stylesheet: { enumerable: true,
            get: function(){ return module.exports.Animation.stylesheet }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete animations[this.uid].instance
            }
        }
    }
})
