"use strict"

var _ = require("../utils")
var klass = require("../class").class

var CSSHook = require("./CSSHook").CSSHook
var Event = require("../Event").Event
var EventTarget = require("../EventTarget").EventTarget
var Serializer = require("../Serializer").Serializer
var UID = require("../UID").UID

module.exports.CssTextUpdateEvent = klass(Event, {
    constructor: function(cssRule){
        Event.call(this, "csstextupdate")

        this.cssRule = cssRule
        this.selectorText = cssRule.selectorText
        this.cssText = cssRule.cssText
    }
  , selectorText: { enumerable: true,
        get: function(){ return this._selectorText }
      , set: function(v){ !this._cssText && Object.defineProperty(this, "_selectorText", { value: v }) }
    }
  , cssText: { enumerable: true,
        get: function(){ return this._cssText }
      , set: function(v){ !this._cssText && Object.defineProperty(this, "_cssText", { value: v }) }
    }
  , cssRule: { enumerable: true,
        get: function(){ return this._cssRule }
      , set: function(v){ !this._cssText && Object.defineProperty(this, "_cssRule", { value: v }) }
    }
})

module.exports.CSSRule = klass(EventTarget, function(statics){
    var rules = Object.create(null)
    var serializer = new Serializer({ delimiter: ":", separator: ";" })
    var rcssparse = /(?:\s|$)*([^{]*)(?:[]\s|$)*{(.*)}(?:\s|$)*/ // TODO make sure this behaves as expected

    Object.defineProperties(statics, {
        serializeCssText: { enumerable: true,
            value: function(o){
                return serializer.serialize(o)
            }
        }
      , objectifyCssText: { enumerable: true,
            value: function(str){
                return serializer.objectify(str)
            }
        }
    })

    return {
        constructor: function(selectorText, cssText, fromstr, dummy, args){
            args = _.spread(arguments)
            dummy = document.createElement("div")

            selectorText = args.length > 1 && _.typeof(args[0]) == "string" && isNaN(+args[0]) ? args.shift()
                         : args.length == 1 && _.typeof(args[0]) == "string" ? (fromstr = true, (rcssparse.exec(args[0])||[])[1]||"")
                         : (fromstr = true, args.shift(), (rcssparse.exec(args[0])||[])[1]||"")

            cssText = CSSHook.testCssText( dummy.style.cssText = fromstr ? (rcssparse.exec(args.pop())||[])[2]||""
                    : _.typeof(args[args.length-1]) == "string" ? args.pop()
                    : _.typeof(args[args.length-1]) == "object" ? module.exports.CSSRule.serializeCssText(args.pop())
                    : "" )


            rules[this.uid] = Object.create(null, {
                instance: { value: this }
              , dummy: { value: dummy }
              , selectorText: { writable: true, value: selectorText}
              , cssText: { writable: true, value: cssText }
            })
        }

      , getProperty: { enumerable: true,
            value: function(){
                return CSSStyleDeclaration.prototype.getPropertyValue.apply(rules[this.uid].dummy.style, arguments)
            }
        }
      , setProperty: { enumerable: true,
            value: function(prop, value, o, n, hooked){
                prop = _.typeof(prop) == "string" ? prop : ""
                value = _.typeof(value) == "string" ? value : ""
                o = rules[this.uid].dummy.style.cssText
                hooked = CSSHook.testProperty(prop, value)
                CSSStyleDeclaration.prototype.setProperty.call(rules[this.uid].dummy.style, hooked.property, hooked.value)
                n = rules[this.uid].dummy.style.cssText

                if ( o !== n )
                  this.dispatchEvent(new module.exports.CssTextUpdateEvent(this))
            }
        }

      , selectorText: { enumerable: true,
            get: function(){
                return rules[this.uid].selectorText
            }
        }
      , cssText: { enumerable: true,
            get: function(){
                return rules[this.uid].dummy.style.cssText
            }
          , set: function(v, o){
                o = rules[this.uid].dummy.style.cssText
                rules[this.uid].dummy.style.cssText = CSSHook.testCssText(v)
                n = rules[this.uid].dummy.style.cssText

                if ( o !== n )
                  this.dispatchEvent(new module.exports.CssTextUpdateEvent(this))
            }
        }
      , toString: { enumerable: true,
            value: function(){
                return [this.selectorText, "{", this.cssText, "}"].join("")
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                delete rules[this.uid]
            }
        }
    }
})
