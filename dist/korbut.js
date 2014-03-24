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
            constructor: function(type, detail){
                type = _.typeof(type) == "string" ? type : function(){ throw new Error("Event.type") }() //TODO
                detail = function(detail){
                    return !detail.length || (detail.length == 1 && "undefined, null".indexOf(_.typeof(detail[0])) != -1 ) ? null
                         : detail.length == 1 && detail[0].constructor === Object && detail[0].hasOwnProperty("detail") ? detail[0].detail
                         : detail.length == 1 ? detail[0]
                         : detail
                }( _.spread(arguments, 1) )

                Object.defineProperties(this, {
                    "_type": { configurable: true, value: type }
                  , "_detail": { configurable: true, value: detail }
                  , "_timestamp": { configurable: true, value: +(new Date) }
                })
            }
          , initEvent: {
                value: function(){
                    return this.constructor.apply(this, arguments)
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

},{"./class":5,"./utils":7}],2:[function(require,module,exports){
void function(_, klass, Event){
    "use strict"

    module.exports.EventTarget = klass(function(statics){

        Object.defineProperties(statics, {
            "isEventListener": {
                value: function(o){
                    return o && (typeof o == "function" || typeof o.handleEvent == "function")
                }
            }
        })

        return {
            addEventListener: { enumerable: true,
                value: function(type, handler, handlers){
                    !this._events && Object.defineProperty(this, "_events", { value: Object.create(null) })

                    if ( arguments.length == 1 && arguments[0].constructor === Object )
                      return function(self, events, k){
                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            self.addEventListener(k, events[k])
                      }( this, arguments[0] )

                    type = _.typeof(type) == "string" ? type : null
                    handler = statics.isEventListener(handler) ? handler : null
                    handlers = this._events[type]

                    if ( !type || !handler )
                      return 0

                    if ( Array.isArray(handlers) )
                      handlers.push(handler)
                    else if ( !handlers || handlers === Object.prototype[type] )
                      this._events[type] = handler
                    else if ( statics.isEventListener(handlers) )
                      this._events[type] = [handlers, handler]

                    return 1
                }
            }
          , removeEventListener: { enumerable: true,
                value: function(type, handler, handlers){
                    !this._events && Object.defineProperty(this, "_events", { value: [] })._events

                    if ( arguments.length == 1 && arguments[0].constructor === Object )
                      return function(self, events, k){
                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            self.removeEventListener(k, events[k])
                      }( this, arguments[0] )

                    type = _.typeof(type) == "string" ? type : null
                    handler = statics.isEventListener(type) || type == "*" ? type : null
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
          , events: { enumerable: true,
                get: function(){
                    return Object.create(this._events||{})
                }
            }

          , dispatchEvent: { enumerable: true,
                value: function(event, handlers, count){
                    event = Event.isImplementedBy(event) ? event : Event.create.apply(null, arguments)
                    handlers = (this._events||{})[event.type]
                    count = 0

                    if ( event.type == "error" && !handlers )
                      throw Event.isImplementedBy(event.detail) ? event.detail : new Error

                    if ( handlers )
                      if ( typeof handlers == "function" )
                        handlers.call(null, event), count++
                      else if ( Array.isArray(handlers) )
                        void function(handlers){
                            while ( handlers.length )
                              if ( typeof handlers[i] == "function" )
                                handlers[i].call(null, event), count++
                              else if ( typeof handlers.handleEvent == "function" )
                                handlers[i].call(handlers, event), count++
                        }( [].concat(handlers) )
                      else if ( typeof handlers.handleEvent == "function" )
                        handlers.call(handlers, event), count++

                    return count
                }
            }
        }
    })

}( require("./utils"), require("./class").class, require("./Event").Event )

},{"./Event":1,"./class":5,"./utils":7}],3:[function(require,module,exports){
void function(klass){
    "use strict"

    module.exports.Iterator = klass(function(statics){

        Object.defineProperties(statics, {
            iterate: { enumerable: true,
                value: function(o, rv, i, l, lead, trail){
                    o = o || Object.create(null)

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

            }
        })

        return {
            constructor: function(o, opt_keys, keys, i, l){
                opt_keys = !!arguments[1] || Object.prototype.toString.call(arguments[0]) == "[object String]"
                keys = statics.iterate(o)
                i = 0
                l = keys.length

                Object.defineProperties(this, {
                    _pointer: { writable: true, value: -1 }
                  , _range: { value: [] }
                })

                for ( ; i < l; i++ )
                  this._range[i] = opt_keys ? [ keys[i] ] : [ keys[i], arguments[0][keys[i]] ]
            }
          , next: { enumerable: true,
                value: function(idx){
                    idx = ++this._pointer

                    if ( idx >= (this._range = this._range || []).length )
                      return { index: null, value: null, done: true }
                    return { index: idx, value: this._range[idx][this._range[idx].length-1], done: false }
                }
            }
        }
    })

}( require("./class").class )

},{"./class":5}],4:[function(require,module,exports){
void function(_, klass){ "use strict"

    module.exports.Promise = klass(function(statics, TRUST_KEY){
        Object.defineProperties(statics, {
            all: { enumerable: true,
                value: function(){}
            }
          , cast: { enumerable: true,
                value: function(){}
            }
          , race: { enumerable: true,
                value: function(){}
            }
          , reject: { enumerable: true,
                value: function(reason){
                    return new module.exports.Promise(function(resolve, reject){
                        reject(reason)
                    })
                }
            }
          , resolve: { enumerable: true,
                value: function(value){
                    return new module.exports.Promise(function(resolve){
                        resolve(value)
                    })
                }
            }
        })

        TRUST_KEY = +(new Date)

        return {
            constructor: function(resolver, internal){
                if ( typeof resolver !== "function" )
                  throw new Error //TODO

                resolver(resolve.bind(this), reject.bind(this))

                function resolve(v, handlers){
                    resolve = reject = function(){}

                    Object.defineProperties(this, {
                        "RESOLVED": { value: TRUST_KEY }
                      , "YIELD": { get: function(){ return v } }
                    })

                    handlers = Array.isArray(this._onresolve) ? [].concat(this._onresolve) : []
                      while ( handlers.length )
                        handlers.shift().call(null, v)
                }

                function reject(r, handlers){
                    resolve = reject = function(){}
                    Object.defineProperties(this, {
                        "REJECTED": { value: TRUST_KEY }
                      , "YIELD": { get: function(){ return r } }
                    })


                    handlers = Array.isArray(this._onreject) ? [].concat(this._onreject) : []
                      while ( handlers.length )
                        handlers.shift().call(null, r)
                }
            }
          , then: { enumerable: true,
                value: function(onresolve, onreject){
                    return function(self, hasResolved, hasRejected){
                          if ( !hasResolved && !hasRejected ) {
                            return new module.exports.Promise(function(resolve, reject){
                                !Array.isArray(self._onresolve) && Object.defineProperty(self, "_onresolve", { value: [] })
                                !Array.isArray(self._onreject) && Object.defineProperty(self, "_onreject", { value: [] })

                                self._onresolve.push(function(v, rv){
                                    try {
                                        rv = onresolve(v)
                                    } catch(e) {
                                        reject(e)
                                        return
                                    }

                                    if ( rv && typeof rv.then == "function" )
                                      rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                    else resolve(rv)
                                })

                                self._onreject.push(function(r, rv){
                                    try {
                                        rv = onreject(r)
                                    } catch(e) {
                                        reject(e)
                                        return
                                    }

                                    if ( rv && typeof rv.then == "function" )
                                      rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                    else resolve(rv)
                                })
                            })
                          }

                          else if ( hasResolved )
                            return new module.exports.Promise(function(resolve, reject, rv){
                                try {
                                    rv = typeof onresolve == "function" ? onresolve(self.YIELD) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })

                          else if ( hasRejected )
                            return new module.exports.Promise(function(resolve, reject, rv){
                                try {
                                    rv = typeof onreject == "function" ? onreject(self.YIELD) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })
                    }(this, this.RESOLVED == TRUST_KEY, this.REJECTED == TRUST_KEY)
                }
            }
          , catch: { enumerable: true,
                value: function(onreject){
                    return function(self){
                        return new module.exports.Promise(function(resolve, reject){
                            self.then(resolve, function(r){
                                reject(r)
                                return onreject(r)
                            })
                        })
                    }( this )
                }
            }
        }
    })

}( require("./utils"), require("./class").class )

},{"./class":5,"./utils":7}],5:[function(require,module,exports){
void function(_){ "use strict"

    module.exports.class = function(args, statics, Class, prototype, k){
        args = _.spread(arguments)
        statics = Object.create(null)
        prototype = Object.create({})

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

        void function(properties){
            while ( properties.length )
              Object.defineProperty(Class, properties[0], Object.getOwnPropertyDescriptor(statics, properties.shift()))
        }( Object.getOwnPropertyNames(statics) )

        !Class.hasOwnProperty("create") && Object.defineProperty(Class, "create", {
            enumerable: true,
            value: function(args){
                args = _.spread(arguments)

                function F(){
                    return Class.apply(this, args)
                }
                F.prototype = Class.prototype

                return new F
            }
        })

        !Class.hasOwnProperty("extend") && Object.defineProperty(Class, "extend", {
            enumerable: true,
            value: function(){
                return module.exports.class.apply(null, [Class].concat(_.spread(arguments)))
            }
        })

        !Class.hasOwnProperty("isImplementedBy") && Object.defineProperty(Class, "isImplementedBy", {
            enumerable: true,
            value: function(o, prototype, k){
                prototype = _.typeof(o) == "function" ? o.prototype : Object.create(null)

                if ( !o )
                  return false

                if ( o instanceof Class )
                  return true

                for ( k in Class.prototype )
                  if ( k != "constructor" && function(o, c){
                      if ( o && c && o == c)
                        return false
                      return true
                  }( Object.getOwnPropertyDescriptor(prototype, k), Object.getOwnPropertyDescriptor(Class.prototype, k) ) ) return false
                return true
            }
        })

        !Class.hasOwnProperty("extend") && Object.defineProperty(Class, "implementsOn", {
            enumerable: true,
            value: function(o, prototype, properties){
                prototype = !_.typeof(o) == "function" ? o.prototype : {}
                properties = Object.getOwnPropertyNames(Class.prototype)

                while ( properties.length )
                  Object.defineProperty(prototype, properties[0], Object.getOwnPropertyDescriptor(Class.prototype, properties.shift()))

                Class.apply(this, _.spread(arguments, 1))
            }
        })

        return Class
    }

    module.exports.singleton = function(F, G){
        F = module.exports.class.apply(null, arguments)
        G = module.exports.class.call(null, F, function(statics, k){
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

},{"./utils":7}],6:[function(require,module,exports){
void function(ns){ "use strict"

    ns.class = require("./class").class
    ns.singleton = require("./class").singleton

    ns.Iterator = require("./Iterator").Iterator
    ns.EventTarget = require("./EventTarget").EventTarget
    ns.Event = require("./Event").Event
    ns.Promise = require("./Promise").Promise

    window.k = ns
}( { version: "korbutJS-ES5-0.0.0-1395644688040" } )

},{"./Event":1,"./EventTarget":2,"./Iterator":3,"./Promise":4,"./class":5}],7:[function(require,module,exports){
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
        return function(o, ntypeof){
            ntypeof = typeof o

            return ntypeof == "object" ? toString.call(o).slice(8, -1).toLowerCase() : ntypeof
        }
    }( Object.prototype.toString )

}()

},{}]},{},[6])