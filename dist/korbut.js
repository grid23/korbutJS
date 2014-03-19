/* Copyright ©2014 Benjamin Moulin <hello@grid23.net>
   This work is free. You can redistribute it and/or modify it under the 
   terms of the Do What The Fuck You Want To Public License, Version 2, 
   as published by Sam Hocevar. See the COPYING file for more details. 
*/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
void function(klass){
    "use strict"

    module.exports.Iterator = klass(function(statics){
        statics.enumerate = function(){
            var o = arguments[0] || Object.create(null)
              , rv, i, l, lead, trail

            try {
                return Object.keys(o)
            } catch(e) {
                rv = []

                if ( Object.prototype.toString.call(o) == "[object String]" )
                  for ( i = 0, l = o.length; i < l; i++ ) {
                      lead = o.charCodeAt(i)
                      trail = o.charCodeAt(i<l-1?i+1:"")

                      rv.push( lead >= 0xD800 && lead <= 0xDBFF && trail >= 0xDC00 && trail <= 0xDFFF ? o[i]+o[++i] : o[i] )
                  }

                return rv
            }
        }

        return {
            constructor: function(){
                module.exports.Iterator.prototype.initIterator.apply(this, arguments)
            }
          , initIterator: {
                value: function(){
                    var opt_keys = !!arguments[1] || Object.prototype.toString.call(arguments[0]) == "[object String]"
                      , keys = statics.enumerate(arguments[0])
                      , i = 0, l = keys.length

                    this._pointer = -1
                    this._range = []

                    for ( ; i < l; i++ )
                      this._range[i] = opt_keys ? [ keys[i] ] : [ keys[i], arguments[0][keys[i]] ]
                }
            }
          , next: { enumerable: true,
                value: function(){
                    var idx = ++this._pointer

                    if ( idx >= (this._range = this._range || []).length )
                      return { index: null, value: null, done: true }
                    return { index: idx, value: this._range[idx][this._range[idx].length-1], done: false }
                }
            }
        }
    })

}( require("./class").class )

},{"./class":2}],2:[function(require,module,exports){
void function(){ "use strict"
    var rnative = /\s*\[native code\]\s*/i

    module.exports.class = function(){
        var args = Array.prototype.slice.call(arguments)
          , statics = Object.create(null), k
          , Class
          , prototype = Object.create({})

        args[args.length-1] = function getDescriptors(descriptors, keys, i, l){
            if ( typeof descriptors == "function" )
              return getDescriptors( descriptors.call(null, statics) )

            descriptors.constructor = descriptors.constructor || function(){}
            Class = typeof descriptors.constructor == "function" && !descriptors.constructor.toString().match(rnative) ? descriptors.constructor
                  : typeof descriptors.constructor.value == "function" && !descriptors.constructor.value.toString().match(rnative) ? descriptors.constructor.value
                  : function(){}
            delete descriptors.constructor

            try {
                return { prototype: Object.create(null, descriptors) }
            } catch(e) {
                keys = Object.keys(descriptors)
                while ( keys.length )
                  void function(key){
                      descriptors[key] = descriptors[key].constructor == Object
                                         && ( descriptors[key].hasOwnProperty("value")
                                              || descriptors[key].hasOwnProperty("get")
                                              || descriptors[key].hasOwnProperty("set") )
                                       ? descriptors[key]
                                       : { configurable: true, enumerable: true, writable: true,
                                           value: descriptors[key] }
                  }( keys.shift() )

                return { prototype: Object.create(null, descriptors) }
            }
        }( args[args.length-1] )

        while ( args.length )
          void function(Super, propertyNames){
              try {
                  propertyNames = Object.getOwnPropertyNames(Super.prototype)
              } catch(e){
                  propertyNames = []
              }

              while ( propertyNames.length )
                void function(property, descriptor){
                    Object.defineProperty(prototype, property, descriptor)
                }( propertyNames[0], Object.getOwnPropertyDescriptor(Super.prototype, propertyNames.shift()) )
          }( args.shift() )
        Object.defineProperty(prototype, "constructor", { configurable: true, value: Class })

        Class.prototype = prototype

        for ( k in statics )
          Class[k] = statics[k]

        return Class
    }

    module.exports.singleton = function(){
        var F = module.exports.class.apply(null, arguments)
          , G = module.exports.class.call(null, F, function(statics, k){
                for ( k in F )
                  statics[k] = F[k]

                return {
                    constructor: function(){
                        if ( G.instance )
                          return G.instance
                        G.instance = this

                        return F.apply(this, arguments)
                    }
                }
            })
    }
}()

},{}],3:[function(require,module,exports){
void function(ns){ "use strict"

    ns.class = require("./class").class
    ns.singleton = require("./class").singleton

    ns.Iterator = require("./Iterator").Iterator

    window.k = ns
}( { version: "korbutJS-ES5-0.0.0-1395240026522" } )

},{"./Iterator":1,"./class":2}]},{},[3])