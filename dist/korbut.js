/* Copyright ©2014 Benjamin Moulin <hello@grid23.net>
   This work is free. You can redistribute it and/or modify it under the 
   terms of the Do What The Fuck You Want To Public License, Version 2, 
   as published by Sam Hocevar. See the COPYING file for more details. 
*/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class

    module = klass(function(statics){

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

}()

},{"./class":9,"./utils":12}],2:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class
      , Event = require("./Event").Event

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

                    if ( arguments.length == 1 && arguments[0] && arguments[0].constructor === Object )
                      return function(self, events, count, k){
                          count = 0

                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            count += self.addEventListener(k, events[k])

                          return count
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
                    !this._events && Object.defineProperty(this, "_events", { value: Object.create(null) })

                    if ( arguments.length == 1 && arguments[0] && arguments[0].constructor === Object )
                      return function(self, events, count, k){
                          count = 0

                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            count += self.removeEventListener(k, events[k])

                          return count
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
          , listeners: { enumerable: true,
                value: function(events, cb){
                    events = _.spread(arguments)
                    cb = typeof events[events.length-1] == "function" ? events.pop() : null

                    void function(self, i, l){
                        for ( ; i < l; i++ )
                          events[i] = function(event){
                              if (  _.typeof(event) != "string" )
                                return void 0

                              return Object.create(null, {
                                  add: { enumerable: true,
                                      value: function(h){
                                          self.addEventListener(event, h)
                                      }
                                  }
                                , remove: { enumerable: true,
                                      value: function(h){
                                        self.removeEventListener(event, h)
                                      }
                                  }
                              })
                          }(events[i])
                    }( this, 0, events.length )

                    if ( cb )
                      cb.apply(null, events)
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

}()

},{"./Event":1,"./class":9,"./utils":12}],3:[function(require,module,exports){
void function(){ "use strict"

    var klass = require("./class").class

    module.exports.Iterator = klass(function(statics){

        Object.defineProperties(statics, {
            iterable: { enumerable: true,
                value: function(o){
                    try {
                        Object.keys(o)
                        return true
                    } catch(e){
                        return o.hasOwnProperty("length")
                    }

                    return false
                }
            }
          , iterate: { enumerable: true,
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
                value: function(cb, idx){
                    cb = typeof cb == "function" ? cb : null
                    idx = ++this._pointer

                    Object.defineProperty(this, "_current", { configurable: true,
                        value: ( idx >= (this._range || []).length ) ? { index: null, key: null, value: null, done: true }
                             : { index: idx, key: this._range[idx][0], value: this._range[idx][this._range[idx].length-1], done: false }
                    })

                    if ( cb )
                      cb(this.current.done, this.current.key, this.current.value)

                    return this.current
                }
            }
          , length: { enumerable: true,
                value: function(){
                    return this._range.length
                }
            }
          , current: { enumerable: true,
                get: function(){
                    if ( this._current )
                      return this._current
                    throw new Error("iterator, not started") //TODO
                }
            }
        }
    })

}()

},{"./class":9}],4:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class
      , Iterator = require("./Iterator").Iterator

    module.exports.Promise = klass(function(statics){
        Object.defineProperties(statics, {
            all: { enumerable: true,
                value: function(){
                    if ( !Iterator.iterable(promises) )
                      throw new TypeError("korbut.Promise.race requires an iterable object as argument 0.")

                    return new module.exports.Promise(function(resolve, reject, iterator, length, value){
                        iterator = new Iterator(promises)
                        length = promises.length()
                        value = []

                        function onresolve(idx){
                            return function(v){
                                value[idx] = v

                                if ( !(--length) )
                                  resolve(value)
                            }
                        }

                        function onreject(e){ reject(e) }

                        while ( !iterator.next().done )
                          void function(iteration, input){
                              input = iteration.value
                              if ( !module.exports.Promise.isImplementedBy(input) )
                                input = module.exports.Promise.cast(input)
                              input.then(onresolve(iteration.index), onreject)
                          }(iterator.current)
                    })
                }
            }
          , cast: { enumerable: true,
                value: function(v){
                    return new module.exports.Promise(function(resolve){ resolve(v) })
                }
            }
          , race: { enumerable: true,
                value: function(promises){
                    if ( !Iterator.iterable(promises) )
                      throw new TypeError("korbut.Promise.race requires an iterable object as argument 0.")

                    return new module.exports.Promise(function(resolve, reject, length, resolved){
                        iterator = new Iterator(promises)
                        length = iterator.length()

                        function onresolve(v){
                            if ( resolved )
                              return

                            resolved = true
                            resolve(v)
                        }

                        function onreject(){
                            if ( !(--length) )
                              reject(new Error("all promises were rejected"))
                        }

                        while ( !iterator.next().done )
                          if ( module.exports.Promise.isImplementedBy(iterator.current.value) )
                            iterator.current.value.then(onresolve, onreject)
                    })
                }
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

        return {
            constructor: function(resolver, resolution){
                if ( typeof resolver !== "function" )
                  throw new TypeError("Constructor korbut.Promise requires a resolver function as argument 0.")

                resolution = { key: "pending", value: null }
                Object.defineProperty(this, "_state", { configurable: true,
                    get: function(){ return resolution }
                })

                resolver(resolve.bind(this), reject.bind(this))

                function resolve(v, handlers){
                    resolve = reject = function(){}

                    resolution.key = "resolved"
                    resolution.value = v
                    Object.freeze(resolution)

                    handlers = Array.isArray(this._onresolve) ? [].concat(this._onresolve) : []
                      while ( handlers.length )
                        handlers.shift().call(null, v)
                }

                function reject(r, handlers){
                    resolve = reject = function(){}

                    resolution.key = "rejected"
                    resolution.value = r
                    Object.freeze(resolution)

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
                                    rv = typeof onresolve == "function" ? onresolve(self._state.value) : null
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
                                    rv = typeof onreject == "function" ? onreject(self._state.value) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })
                    }(this, this._state.key == "resolved", this._state.key == "rejected" )
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
          , state: { enumerable: true,
                get: function(){
                    return (this._state||{}).key
                }
            }
        }
    })

}()

},{"./Iterator":3,"./class":9,"./utils":12}],5:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class

    module.exports.Route = klass(function(statics){

        return {
            constructor: function(path, detail){
                path = _.typeof(path) == "string" ? path : function(){ throw new Error("Route.path") }() //TODO
                detail = function(detail){
                    return !detail.length || (detail.length == 1 && "undefined, null".indexOf(_.typeof(detail[0])) != -1 ) ? null
                         : detail.length == 1 && detail[0].constructor === Object && detail[0].hasOwnProperty("detail") ? detail[0].detail
                         : detail.length == 1 ? detail[0]
                         : detail
                }( _.spread(arguments, 1) )

                Object.defineProperties(this, {
                    "_path": { configurable: true, value: path }
                  , "_detail": { configurable: true, value: detail }
                  , "_timestamp": { configurable: true, value: +(new Date) }
                  , "_matches": { configurable: true, value: {} }
                })
            }

          , path: { enumerable: true,
                get: function(){
                    return this._path
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
          , matches: { enumerable: true,
                get: function(){
                    return this._matches
                }
            }
        }
    })

}()

},{"./class":9,"./utils":12}],6:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class
      , Iterator = require("./Iterator").Iterator
      , Route = require("./Route").Route

    module.exports.Router = klass(function(statics){
        Object.defineProperties(statics, {
            dispatcher: { enumerable: true,
                value: function(cache){
                    function getRule(str, regexp, assignments, split){
                        if ( !cache[str] )
                          if ( str.indexOf(":") == -1 )
                            cache[str] = new RegExp(str)
                          else {
                            assignments = []
                            regexp = []
                            split = str.split("/")

                            while ( split.length )
                              void function(part){
                                  if ( part[0] === ":" )
                                    assignments.push(part.slice(1)),
                                    regexp.push("([^\\\/]*)")
                                  else
                                    regexp.push(part)
                              }( split.shift() )

                            cache[str] = new RegExp(regexp.join("\\\/"))
                            cache[str].assignments = assignments
                          }

                        return cache[str]
                    }

                    return function(route, path, rule, match){
                        rule = getRule(route.path)
                        match = path.match(rule)

                        if ( !match )
                          return false

                        if ( match.length == 1 )
                          return true

                        return function(i, l){
                            for ( ; i < l; i++ )
                              route._matches[rule.assignments[i]] = match[i+1]
                        }(0, rule.assignments.length)
                    }
                }( Object.create(null) )
            }
          , "isRouteHandler": {
                value: function(o){
                    return o && (typeof o == "function" || typeof o.handleRoute == "function")
                }
            }
        })

        return {
            constructor: function(dispatcher){
                if ( typeof dispatcher == "function" )
                  Object.defineProperty(this, "_dispatcher", { configurable: true, value: dispatcher })
            }
          , addRouteHandler: { enumerable: true,
                value: function(route, handler, handlers){
                    !this._routes && Object.defineProperty(this, "_routes", { value: Object.create(null) })

                    if ( arguments.length == 1 && arguments[0] && arguments[0].constructor === Object )
                      return function(self, routes, count, k){
                          count = 0

                          for ( k in routes ) if ( routes.hasOwnProperty(k) )
                            count += this.addRouteHandler(k, routes[k])

                          return count
                      }(this, arguments[0])

                    route = _.typeof(route) == "string" ? route : null
                    handler = statics.isRouteHandler(handler) ? handler : null
                    handlers = this._routes[route]

                    if ( !route || !handler )
                      return 0
                    if ( Array.isArray(handlers) )
                      handlers.push(handler)
                    else if ( !handlers || handlers === Object.prototype[route] )
                      this._routes[route] = handler
                    else if ( statics.isRouteHandler(handlers) )
                      this._routes[route] = [handlers, handler]

                    return 1
                }
            }
          , removeRouteHandler: { enumerable: true,
                value: function(route, handler){
                    !this._routes && Object.defineProperty(this, "_routes", { value: Object.create(null) })

                    if ( arguments.length == 1 && arguments[0] && arguments[0].constructor === Object )
                      return function(self, routes, count, k){
                          count = 0

                          for ( k in routes ) if ( routes.hasOwnProperty(k) )
                            count += this.removeRouteHandler(k, routes[k])

                          return count
                      }(this, arguments[0])

                    route = _.typeof(route) == "string" ? route : null
                    handler = statics.isRouteHandler(route) || route == "*" ? route : null
                    handlers = this.routes[route]

                    if ( !route || !handler || !handlers )
                      return 0

                    if ( handlers === handler ) {
                        delete this._routes[route]
                        return 1
                    }

                    if ( Array.isArray(handlers) )
                      return function(self, copy, idx, count){
                          if ( handler === "*" ) {
                              count = handlers.length
                              delete self._routes[route]

                              return count
                          }

                          count = 0

                          while ( idx = copy.indexOf(handler) > -1 )
                            copy.splice(idx, 1), count++

                          self._routes[route] = copy

                          if ( self._routes[route].length == 0 )
                            delete self._routes[route]

                          return count
                      }( this, [].concat(handlers) )
                }
            }
          , dispatchRoute: { enumerable: true,
                value: function(route, iterator){
                    route = Route.isImplementedBy(route) ? route : Route.create.apply(null, arguments)
                    iterator = function(routes, copy, keys){
                        keys = Object.keys(routes).sort()

                        while ( keys.length )
                          copy[keys[0]] = routes[keys.shift()]

                        return new Iterator(copy)
                    }( this._routes || Object.create(null), Object.create(null) )

                    return function(self, hits, hit, rv){
                        hits = 0

                        function handle(iteration){
                            if ( statics.isRouteHandler(iteration.value) ) {
                              if ( iteration.key !== "*" )
                                hits++

                              rv = iteration.value.call(null, route, next, hits)
                              return _.typeof(rv) !== "undefined" ? rv : hits
                            } else if ( Array.isArray(iteration.value) )
                                return function(handlers, _next){
                                    function _next(handler){
                                        if ( !handlers.length )
                                          return next()

                                        handler = handlers.shift()

                                        if ( iteration.key !== "*" )
                                          hits++

                                        rv = handler.call(null, route, handlers.length?_next:next, hits)
                                        return _.typeof(rv) !== "undefined" ? rv : hits
                                    }

                                    return _next()
                                }( [].concat(iteration.value) )
                        }

                        function next(){
                            iterator.next()

                            if ( iterator.current.done == true )
                              return hits

                            hit = iterator.current.key === "*" ? true
                                : self.dispatcher.call(this, route, iterator.current.key)

                            if ( !hit )
                              return next()
                            return handle(iterator.current)
                        }

                        return next()
                    }(this)
                }
            }
          , handlers: { enumerable: true,
                value: function(routes, cb){
                    routes = _.spread(arguments)
                    cb = typeof routes[routes.length-1] == "function" ? routes.pop() : null

                    void function(self, i, l){
                        for ( ; i < l; i++ )
                          routes[i] = function(route){
                              if ( _.typeof(route) != "string" )
                                return void 0

                              return Object.create(null, {
                                  add: { enumerable: true,
                                      value: function(h){
                                          return self.addRouteHandler(route, h)
                                      }
                                  }
                                , remove: { enumerable: true,
                                      value: function(h){
                                          return self.removeRouteHandler(route, h)
                                      }
                                  }
                              })
                          }( routes[i] )
                    }(this, 0, routes.length)

                    if ( cb )
                      cb.apply(routes)
                }
            }

          , dispatcher: { enumerable: true,
                get: function(){
                    return this._dispatcher || statics.dispatcher
                }
            }

        }
    })

}()

},{"./Iterator":3,"./Route":5,"./class":9,"./utils":12}],7:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class
      , Iterator = require("./Iterator").Iterator

    module.exports.Serializer = klass(function(statics){
        var DELIMITER = "="
          , SEPARATOR = "&"
          , rspacetoplus = /%20/g
          , rplustospace = /\+/g

        Object.defineProperties(statics, {
            serialize: { enumerable: true,
                value: function(o, s, iterator, del, sep){
                    s = []
                    iterator = new Iterator(o)
                    del = this.delimiter || DELIMITER
                    sep = this.separator || SEPARATOR

                    while( !iterator.next().done )
                      s.push( escape(iterator.current.key) + del + encodeURIComponent(iterator.current.value) )

                    return s.join(sep).replace(rspacetoplus, "+")
                }
            }
          , objectify: { enumerable: true,
                value: function(s, o, iterator, del, sep){
                    o = {}
                    del = this.delimiter || DELIMITER
                    sep = this.separator || SEPARATOR
                    iterator = new Iterator(s.search(sep) != -1 ? s.split(sep) : s.length ? [str] : [])

                    while ( !iterator.next().done )
                      void function(pair, idx, k, v){
                          idx = pair.indexOf(del)
                          k = pair.split(del, 1)
                          v = pair.slice(idx+1)

                          o[k] = v
                      }( unescape(iterator.current.value.replace(rplustospace, "%20")) )

                    return o
                }
            }
        })

        return {
            constructor: function(dict){
                dict = dict && dict.constructor === Object ? dict : {}

                _.typeof(dict.delimiter) == "string" && Object.defineProperty(this, "_delimiter", { value: dict.delimiter })
                _.typeof(dict.separator) == "string" && Object.defineProperty(this, "_separator", { value: dict.separator })
            }
          , serializer: { enumerable: true,
                value: function(o){
                    return statics.serialize.call(this, o)
                }
            }
          , objectify: { enumerable: true,
                value: function(s){
                    return statics.objectify.call(this, s)
                }
            }
        }
    })

}()

},{"./Iterator":3,"./class":9,"./utils":12}],8:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class

    module.exports.UID = klass(function(statics){
        var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
          , MAP = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
          , RADIX = 16
          , REGEXP = /[xy]/g

        Object.defineProperties(statics, {
            uid: { enumerable: true,
                value: function(map, radix, date, regexp){
                      map = _.typeof(this.map) == "string" ? this.map : MAP
                      radix = _.typeof(this.radix) == "number" ? this.radix : RADIX
                      regexp = _.typeof(this.regexp) == "regexp" ? this.regexp : REGEXP
                      date = Date.now()


                    return map.replace(regexp, function(c, r){
                        r = (date + Math.random()*radix)%radix |0

                        if ( c === "y")
                          r = (r & 0x3)|0x8

                        return CHARS[r]
                    })
                }
            }
        })

        return {
            constructor: function(dict){
                dict = dict && dict.constructor === Object ? dict : {}

                _.typeof(dict.map) == "string" && Object.defineProperty(this, "_map", { value: dict.map })
                _.typeof(dict.radix) == "number" && Object.defineProperty(this, "_map", { value: dict.number })
            }
          , generate: { enumerable: true,
                value: function(){
                    return statics.uid.call(this)
                }
            }
          , map: { enumerable: true,
                get: function(){
                    return this._map || MAP
                }
            }
          , radix: { enumerable: true,
                get: function(){
                    return this._radix || RADIX
                }
            }
        }
    })

}()

},{"./class":9,"./utils":12}],9:[function(require,module,exports){
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

},{"./utils":12}],10:[function(require,module,exports){
void function(){
    "use strict"
    var Promise = require("./Promise").Promise

    module.exports = new Promise(function(resolve, reject, ready){
        function onready(){
            if ( ready )
              return
            ready = true

            setTimeout(resolve, 4, {
                timestamp: Date.now()
              , nodes: {
                    documentElement: document.documentElement
                  , head: document.head
                  , body: document.body
                  , title: function(node){
                        if ( node ) return node
                        return document.head.appendChild(document.createElement("title"))
                    }( document.head.getElementsByTagName("title")[0] )
                  , viewport: function(node){
                        if ( node ) return node
                        node = document.createElement("meta")
                        node.setAttribute("name", "viewport")
                        node.setAttribute("content", "")
                        return document.head.appendChild(node)
                  }( document.head.querySelector("meta[name=viewport]") )
                }
            })
        }

        function isready(){
            return "interactive,complete".indexOf(document.readyState) != -1
        }

        if ( isready() )
          onready()
        else
            window.addEventListener("DOMContentLoaded", onready, true),
            window.addEventListener("load", onready, true),
            document.addEventListener("readystatechange", isready, true)
    })

}()

},{"./Promise":4}],11:[function(require,module,exports){
void function(ns){ "use strict"

    var domReady = require("./domReady")

    window.korbut = function(cb){
        if ( typeof cb == "function" )
            domReady.then(cb)
    }

    Object.defineProperties(window.korbut, {
        utils: { enumerable: true, value: require("./utils").utils }
      , class: { enumerable: true, value: require("./class").class }
      , singleton: { enumerable: true, value: require("./class").singleton }

      , Iterator: { enumerable: true, value: require("./Iterator").Iterator }

      , EventTarget: { enumerable: true, value: require("./EventTarget").EventTarget }
      , Event: { enumerable: true, value: require("./Event").Event }

      , Promise: { enumerable: true, value: require("./Promise").Promise }

      , Router: { enumerable: true, value: require("./Router").Router }
      , Route: { enumerable: true, value: require("./Route").Route }

      , UID: { enumerable: true, value: require("./UID").UID }
      , Serializer: { enumerable: true, value: require("./Serializer").Serializer }
    })

}( { version: "korbutJS-ES5-0.0.1-1396275302231" } )

},{"./Event":1,"./EventTarget":2,"./Iterator":3,"./Promise":4,"./Route":5,"./Router":6,"./Serializer":7,"./UID":8,"./class":9,"./domReady":10,"./utils":12}],12:[function(require,module,exports){
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

},{}]},{},[11])