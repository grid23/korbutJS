"use strict"

var _ = require("../utils")
var cssProperties = window.getComputedStyle(document.createElement("div"))
var klass = require("../class").class

var UID = require("../UID").UID


module.exports.CSSHook = klass(function(statics){
    var hooks = Object.create(null)

    Object.defineProperties(statics, {
        testProperty: { enumerable: true,
            value: function(property, value){
                return hooks[property] ? hooks[property].instance.test(value) : {
                    property: property
                  , value: value
                  , originalProperty: property
                }
            }
        }
      , testCssText: { enumerable: true,
            value: function(cssText, pairs, rv){
                try {
                    pairs = (_.typeof(cssText) == "string" ? cssText : "").split(";")
                    rv = []

                    while ( pairs.length )
                      void function(pair, idx, key, value, hooked){
                          idx = pair.search(":")

                          if ( idx == -1 )
                            return

                          key = pair.split(":")[0].trim()
                          value = pair.slice(idx+1).trim()
                          hooked = module.exports.CSSHook.testProperty(key, value)

                          rv.push( [hooked.property, ":", hooked.value].join("") )
                      }( pairs.shift().trim() )

                    return rv.join(";")
                } catch(e) {
                    console.error(e)
                    return cssText
                }
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


new module.exports.CSSHook("transition", function(props, prop, div){
    props = ["transform"]

    div = document.createElement("div")
    div.style.cssText = "-ms-transform:scale(1,1)"

    if ( div.style.cssText.length )
      return function(value, i, l){
          for ( i = 0, l = props.length; i < l; i++)
            value = value.replace(new RegExp("( |^)"+props[i], "g"), " -ms-"+props[i])
          return { property: "transition", value: value.trim() }
      }
    else if ( cssProperties.getPropertyValue("transform") != null )
      return function(value){
          return { property: "transition", value: value }
      }
    else
      return function(value, i, l){
          for ( i = 0, l = props.length; i < l; i++)
            value = value.replace(new RegExp("( |^)"+props[i], "g"), " -webkit-"+props[i])
          return { property: "transition", value: value.trim() }
      }
}())

new module.exports.CSSHook("transform", function(prop, div){
    div = document.createElement("div")
    div.style.cssText = "-ms-transform:scale(1,1)"

    if ( div.style.cssText.length && !_.native(window.atob) ) // ie9!
      return function(value){
          return { property: "-ms-transform", value: value, force: true }
      }
    else if ( cssProperties.getPropertyValue("transform") != null )
      return function(value){
          return { property: "transform", value: value, force: true }
      }
    else
      return function(value){
          return { property: "-webkit-transform", value: value, force: true }
      }
}())
