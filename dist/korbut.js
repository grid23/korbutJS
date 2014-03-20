/* Copyright ©2014 Benjamin Moulin <hello@grid23.net>
   This work is free. You can redistribute it and/or modify it under the 
   terms of the Do What The Fuck You Want To Public License, Version 2, 
   as published by Sam Hocevar. See the COPYING file for more details. 
*/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
void function(_, klass){
    "use strict"

    module.exports.Event = klass(function(statics){

        return {
            constructor: function(){
                module.exports.Event.prototype.initEvent.apply(this, arguments)
            }
          , initEvent: {
                value: function(){
                    var args = _.spread(arguments)
                      , data = args[args.length-1] && args[args.length-1].constructor === Object ? args.pop() : {}
                      , detail = this.detail !== void 0 && data.detail !== void 0 && data.detail !== null ? data.detail : null
                      , type = !this.type && _.typeof(args[0]) == "string" ? args.shift()
                             : !this.type ? "error"
                             : null

                    if ( !this.type )
                      Object.defineProperty(this, "_type", { value: type })

                    if ( this.detail !== void 0 )
                      Object.defineProperty(this, "_detail", { value: detail })

                    Object.defineProperty(this, "_timestamp", { value: +(new Date) })
                }
            }

          , type: { enumerable: true,
                get: function(){
                    return this._type
                }
            }
          , timestamp: { enumerable: true,
                get: function(){
                    return this._timestamp || 0
                }
            }
          , detail: { enumerable: true,
                get: function(){
                    return this._detail
                }
            }
        }
    })

}( require("./utils"), require("./class").class )

},{"./class":4,"./utils":6}],2:[function(require,module,exports){
void function(_, klass, Event){
    "use strict"

    module.exports.EventTarget = klass(function(statics){
        function isEventListener(o){
            return o && typeof o == "function" || typeof o.handleEvent == "function"
        }

        return {
            addEventListener: { enumerable: true,
                value: function(){
                    this._events = this._events || Object.defineProperty(this, "_events", { value: Object.create(null) })._events

                    var type, handler, handlers

                    if ( arguments.length == 1 && arguments[0].constructor === Object )
                      return function(self, events, k){
                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            self.addEventListener(k, events[k])
                      }( this, arguments[0] )

                    type = _.typeof(arguments[0]) == "string" ? arguments[0] : null
                    handler = isEventListener(arguments[1]) ? arguments[1] : null
                    handlers = this._events[type]

                    if ( !type || !handler )
                      return 0

                    if ( Array.isArray(handlers) )
                      handlers.push(handler)
                    else if ( !handlers || handlers === Object.prototype[type] )
                      this._events[type] = handler
                    else if ( isEventListener(handlers) )
                      this._events[type] = [handlers, handler]

                    return 1
                }
            }
          , removeEventListener: { enumerable: true,
                value: function(){
                    this._events = this._events || Object.defineProperty(this, "_events", { value: [] })._events

                    var type, handler, handlers

                    if ( arguments.length == 1 && arguments[0].constructor === Object )
                      return function(self, events, k){
                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            self.removeEventListener(k, events[k])
                      }( this, arguments[0] )

                    type = _.typeof(arguments[0]) == "string" ? arguments[0] : null
                    handler = isEventListener(arguments[1]) || arguments[1] == "*" ? arguments[1] : null
                    handlers = this._events[type]

                    if ( !type || !handler || !handlers )
                      return 0


                    if ( handlers === handler ) {
                        delete this._events[type]
                        return 1
                    }

                    if ( Array.isArray(handlers) )
                      return function(self, copy, idx, count){
                          if ( handler === "*" ) {
                              count = handlers.length
                              delete self._events[type]

                              return count
                          }

                          count = 0

                          while ( idx = copy.indexOf(handler) > -1 )
                            copy.splice(idx, 1), count++

                          self._events[type] = copy

                          if ( self._events[type].length == 0 )
                            delete self._events[type]

                          return count
                      }( this, [].concat(handlers) )
                }
            }
          , getEventlisteners: { enumerable: true,
                value: function(){
                    var handlers = (this._events||Object.create(null))[arguments[0]]

                    return Array.isArray(handlers) ? [].concat(handlers)
                         : handlers ? [handlers] : []
                }
            }

          , dispatchEvent: { enumerable: true,
                value: function(){
                    var event = Event.isImplementedBy(arguments[0]) ? arguments[0] : Event.create.apply(null, arguments)
                      , handlers = (this._events||{})[event.type]
                      , count = 0

                    if ( event.type == "error" && !handlers )
                      throw ( event.detail.object || event.detail[0] || new Error(event.detail.message) )

                    if ( handlers )
                      if ( _.typeof(handlers) == "function" )
                        handlers.call(null, event), count++
                      else if ( _.typeof(handlers.handleEvent) == "function" )
                        handlers.call(handlers, event), count++
                      else if ( Array.isArray(handlers) )
                        void function(handlers){
                            while ( handlers.length )
                              if ( _.typeof(handlers[i]) == "function" )
                                handlers[i].call(null, event), count++
                              else if ( _.typeof(handlers.handleEvent) == "function" )
                                handlers[i].call(handlers, event), count++
                        }( [].concat(handlers) )

                    return count
                }
            }
        }
    })

}( require("./utils"), require("./class").class, require("./Event").Event )

},{"./Event":1,"./class":4,"./utils":6}],3:[function(require,module,exports){
void function(klass){
    "use strict"

    module.exports.Iterator = klass(function(statics){
        statics.iterate = function(){
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
                      , keys = statics.iterate(arguments[0])
                      , i = 0, l = keys.length

                    Object.defineProperties(this, {
                        _pointer: { writable: true, value: -1 }
                      , _range: { value: [] }
                    })

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

},{"./class":4}],4:[function(require,module,exports){
void function(_){ "use strict"

    module.exports.class = function(){
        var args = _.spread(arguments)
          , statics = Object.create(null), k
          , Class
          , prototype = Object.create({})

        args[args.length-1] = function getDescriptors(descriptors, keys, i, l){
            if ( _.typeof(descriptors) == "function" )
              return getDescriptors( descriptors.call(null, statics) )

            descriptors.constructor = descriptors.hasOwnProperty("constructor") ? descriptors.constructor : function(){}
            Class = _.typeof(descriptors.constructor) == "function" && !_.native(descriptors.constructor) ? descriptors.constructor
                  : _.typeof(descriptors.constructor.value) == "function" && !_.native(descriptors.constructor.value) ? descriptors.constructor.value
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

        Class.create = function(){
            var ars = _.spread(arguments)
            function F(){
                return Class.apply(this, args)
            }
            F.prototype = Class.prototype

            return new F
        }

        Class.extend = function(){
            return module.exports.class.apply(null, [Class].concat(_.spread(arguments)))
        }

        Class.isImplementedBy = function(){
            var prototype = _.typeof(arguments[0]) == "function" ? arguments[0].prototype : Object.create(null)
              , k

            if ( !o )
              return false

            if ( o instanceof Class )
              return true

            for ( k in Class.prototype )
              if ( k != "contstructor" && Object.getOwnPropertyDescriptor(prototype, k).value != Object.getOwnPropertyDescriptor(Class.prototype, k).value )
                return false
            return true
        }

        Class.implementsOn = function(){
            var prototype = !_.typeof(arguments[0]) == "function" ? arguments[0].prototype : {}
              , properties = Object.getOwnPropertyNames(Class.prototype)

            while ( properties.length )
              Object.defineProperty(prototype, properties[0], Object.getOwnPropertyDescriptor(Class.prototype, properties.shift()))
        }

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
}( require("./utils") )

},{"./utils":6}],5:[function(require,module,exports){
void function(ns){ "use strict"

    ns.class = require("./class").class
    ns.singleton = require("./class").singleton

    ns.Iterator = require("./Iterator").Iterator
    ns.EventTarget = require("./EventTarget").EventTarget
    ns.Event = require("./Event").Event

    window.k = ns
}( { version: "korbutJS-ES5-0.0.0-1395332472090" } )

},{"./Event":1,"./EventTarget":2,"./Iterator":3,"./class":4}],6:[function(require,module,exports){
void function(){ "use strict"

    module.exports.native = function(rnative){
        return function(fn){
            try {
                return typeof fn == "function" ? !!fn.toString().match(rnative) : false
            } catch(e) {
                return null
            }
        }
    }( /\s*\[native code\]\s*/i )

    module.exports.spread = function(slice){
        return function(o, i){
            return slice.call(o, i)
        }
    }( Array.prototype.slice )

    module.exports.typeof = function(toString){
        return function(o){
            var ntypeof = typeof o

            return typeof o != "object" ? toString.call(o).slice(8, -1).toLowerCase()
                 : ntypeof
        }
    }( Object.prototype.toString )

}()

},{}]},{},[5])