"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID

module.exports.Event = klass(function(statics){
    var events = Object.create(null)

    return {
        constructor: function(type, detail){
            type = _.typeof(type) == "string" ? type : function(){ throw new Error("Event.type") }() //TODO
            detail = function(detail){
                return detail.length == 1 && _.typeof(detail[0]) == "object" && _.typeof(detail[0].detail) == "object" ? function(o, t, k){
                          while ( k.length ) Object.defineProperty( t, k[0], Object.getOwnPropertyDescriptor(o, k.shift()) )
                          return t
                       }( detail[0].detail, Object.create({}), Object.getOwnPropertyNames(detail[0].detail) )
                     : detail.length == 1 && "undefined, null".indexOf(_.typeof(detail[0])) > -1 ? null
                     : detail.length == 1 ? detail[0]
                     : detail.length > 0 ? [].concat(detail)
                     : null
            }( _.spread(arguments, 1))

            events[this.uid] = Object.create(null, {
                type: { value: type }
              , detail: { value: detail  }
              , timestamp: { value: Date.now() }
            })
        }
      , type: { enumerable: true,
            get: function(){ return events[this.uid].type }
        }
      , detail: { enumerable: true,
            get: function(){ return events[this.uid].detail }
        }
      , timestamp: { enumerable: true,
            get: function(){ return events[this.uid].timestamp }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete events[this.uid]
            }
        }
    }
})
