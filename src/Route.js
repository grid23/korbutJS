"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Iterator = require("./Iterator").Iterator
var UID = require("./UID").UID

module.exports.Route = klass(function(statics){
    var routes = Object.create(null)

    return {
        constructor: function(path, dict, detail){
            path = _.typeof(path) == "string" ? path : function(){ throw new Error("Route.path") }() //TODO
            dict = _.typeof(dict) == "object" ? dict : {}

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


            routes[this.uid] = Object.create(null, {
                path: { value: path }
              , detail: { value: detail, configurable: detail === null ? true : false, writable: detail === null ? true : false }
              , timestamp: { value: Date.now() }
              , matches: { value: {} }
              , request: { value: dict.request||{} }
              , response: { value: dict.response||{} }
            })
        }

      , path: { enumerable: true,
            get: function(){
                return routes[this.uid].path
            }
        }
      , timestamp: { enumerable: true,
            get: function(){
                return routes[this.uid].timestamp
            }
        }
      , detail: { enumerable: true,
            get: function(){ return routes[this.uid].detail }
          , set: function(v, iterator){
                if ( !Iterator.iterable(v) )
                  return

                if ( _.typeof(routes[this.uid].detail) == "null" )
                  routes[this.uid].detail = {}

                if ( _.typeof(routes[this.uid].detail) != "object" )
                  return

                iterator = new Iterator(v)
                while ( !iterator.next().done )
                  routes[this.uid].detail[iterator.current.key] = iterator.current.value
            }
        }
      , request: { enumerable: true,
            get: function(){ return routes[this.uid].request }
        }
      , response: { enumerable: true,
            get: function(){ return routes[this.uid].response }
        }
      , matches: { enumerable: true,
            get: function(){ return routes[this.uid].matches }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){ delete routes[this.uid] }
        }
    }
})
