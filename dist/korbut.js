/* Copyright ©2014 Benjamin Moulin <hello@grid23.net>
   This work is free. You can redistribute it and/or modify it under the 
   terms of the Do What The Fuck You Want To Public License, Version 2, 
   as published by Sam Hocevar. See the COPYING file for more details. 
*/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Stylesheet = require("./Stylesheet").Stylesheet

    module.exports.Animation = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()

},{"./Stylesheet":16,"./class":21,"./utils":24}],2:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.Matrix = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })

    module.exports.ClientRect = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()

},{"./class":21,"./utils":24}],3:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Event = require("./Event").Event
    var Model = require("./Model").Model
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Serializer = require("./Serializer").Serializer

    module.exports.Collection = klass(EventTarget, function(statics){
        Object.defineProperties(statics, {
            Serializer: { enumerable: true,
                value: new Serializer({delimiter: ":", separator: "|"})
            }
        })

        return {
            constructor: function(){

            }
          , addModel: { enumerable: true,
                value: function(){

                }
            }
          , removeModel: { enumerable: true,
                value: function(){

                }
            }
          , sort: { enumerable: true,
                value: function(){

                }

            }
          , each: { enumerable: true,
                value: function(){

                }
            }
          , find: { enumerable: true,
                value: function(){

                }
            }
          , subset: { enumerable: true,
                value: function(){

                }
            }

          , Model: { enumerable: true,
                get: function(){
                    return this._Model || Model
                }
            }
          , Serializer: { enumerable: true,
                get: function(){
                    return this._Serializer || statics.Serializer
                }
            }
        }
    })

}()

},{"./Event":6,"./EventTarget":7,"./Iterator":8,"./Model":9,"./Serializer":14,"./UID":18,"./class":21,"./utils":24}],4:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Model = require("./Model").Model

    module.exports.Cookie = klass(Model, function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()

},{"./Model":9,"./class":21,"./utils":24}],5:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.CustomEvent = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()

},{"./class":21,"./utils":24}],6:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var UID = require("./UID").UID

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

}()

},{"./UID":18,"./class":21,"./utils":24}],7:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Event = require("./Event").Event

    module.exports.EventTarget = klass(function(statics){

        Object.defineProperties(statics, {
            "isEventListener": { enumerable: true,
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

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    if ( !this._uid )
                      this._uid = UID.uid()
                    return this._uid
                }
            }
        }
    })

}()

},{"./Event":6,"./class":21,"./utils":24}],8:[function(require,module,exports){
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
                    if ( !this._current )
                      this.next()
                    return this._current
                }
            }
        }
    })

}()

},{"./class":21}],9:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Event = require("./Event").Event
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Serializer = require("./Serializer").Serializer

    module.exports.Collection = klass(EventTarget, function(statics){

        return {
            constructor: function(){

            }
          , addModel: { enumerable: true,
                value: function(){

                }
            }
          , removeModel: { enumerable: true,
                value: function(){

                }
            }
          , find: { enumerable: true,
                value: function(){

                }
            }
          , subset: { enumerable: true,
                value: function(){

                }
            }
          , serialize: { enumerable: true,
                value: function(){

                }

            }

          , Serializer: { enumerable: true,
                get: function(){
                    return this._serializer || module.exports.Collection.Serializer
                }
            }
        }
    })

    module.exports.Model = klass(EventTarget, function(statics){
        function fromObject(model, o, root, iterator){
            root = !!root ? root+".":""
            iterator = new Iterator(o)


            while ( !iterator.next().done )
              model.setItem(root+iterator.current.key, iterator.current.value)
        }

        function fromString(model, items, o){
            try {
                o = JSON.parse(items)
            } catch(e){
                try {
                    o = model.serializer.objectify(items)
                } catch(e){
                    o = {}
                }
            }

            return fromObject(model, o)
        }

        return {
            constructor: function(items){
                this.defaults && this.setItem(this.defaults)
                items && items.constructor === Object && this.setItem(items)
            }
          , setItem: { enumeable: true,
                value: function(){

                }
            }
          , getItem: { enumerable: true,
                value: function(){

                }
            }
          , removeItem: { enumerable: true,
                value: function(){

                }
            }
          , items: { enumerable: true,
                value: function(items, cb){
                    items = _.spread(arguments)
                    cb = typeof items[items.length-1] == "function" ? items.pop() : null

                    void function(self, i, l){
                        for ( ; i < l; i++ )
                          items[i] = function(item){
                              if ( _.typeof(item) != "string" )
                                return void 0

                              return {
                                  set: function(v){
                                      return self.setItem(item, v)
                                  }
                                , get: function(){
                                      return self.getItem(item)
                                  }
                                , remove: function(){
                                      return self.removeItem(item)
                                  }

                                , on: function(e, h){
                                      return self.addEventListner(item+":"+"e", h)
                                  }
                                , off: function(e, h){
                                      return self.removeEventListner(item+":"+"e", h)
                                  }
                              }
                          }(items[i])
                    }( this, 0, items.length )

                    if ( cb )
                      cb.apply(null, items)
                }
            }
          , serialize: { enumerable: true,
                value: function(){

                }
            }

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    if ( !this._uid )
                      this._uid = UID.uid()
                    return this._uid
                }
            }
          , defaults: { enumerable: true,
                get: function(){
                    return this._defaults
                }
            }
          , Serializer: { enumerable: true, configurable: true,
                get: function(){
                    return this._Serializer || Serializer
                }
            }
        }
    })

}()

},{"./Event":6,"./EventTarget":7,"./Iterator":8,"./Serializer":14,"./UID":18,"./class":21,"./utils":24}],10:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.PointerEvent = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()

},{"./class":21,"./utils":24}],11:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator

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
                Object.defineProperty(this, "_state", { get: function(){ return resolution } })

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
          , state: { enumerable: true, configurable: true,
                get: function(){
                    return (this._state||{}).key
                }
            }
        }
    })

}()

},{"./Iterator":8,"./class":21,"./utils":24}],12:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

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

},{"./class":21,"./utils":24}],13:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator
    var Route = require("./Route").Route
    var UID = require("./UID").UID

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
          , "isRouteHandler": { enumerable: true,
                value: function(o){
                    return o && (typeof o == "function" || typeof o.handleRoute == "function")
                }
            }
        })

        return {
            constructor: function(dispatcher){
                if ( typeof dispatcher == "function" )
                  dispatcher.call(this, function(self){
                      return function dispatch(){
                          return self.dispatch.apply(self, arguments)
                      }
                  }(this))
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

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    this._uid = UID.uid()
                    return this._uid
                }
            }

        }
    })

}()

},{"./Iterator":8,"./Route":12,"./UID":18,"./class":21,"./utils":24}],14:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator

    module.exports.Serializer = klass(function(statics){
        var DELIMITER = "="
        var SEPARATOR = "&"
        var rspacetoplus = /%20/g
        var rplustospace = /\+/g

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
          , serialize: { enumerable: true,
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

},{"./Iterator":8,"./class":21,"./utils":24}],15:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.Service = klass(function(statics){

        return {
            constructor: function(){

            }
        }
    })
}()

},{"./class":21,"./utils":24}],16:[function(require,module,exports){
void function(){ "use strict"

    var utils = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator
    var EventTarget = require("./EventTarget").EventTarget
    var domReady = require("./domReady").domReady

    module.exports.CSSRule = klass(function(statics){

        return {
            constructor: function(dict, properties, cssRulesHandler){

            }
          , property: { enumerable: true,
                value: function(property, value, priority){

                }
            }
          , priority: { enumerable: true,
                value: function(property, priority){

                }
            }
        }
    })

    module.exports.Stylesheet = klass(EventTarget, function(statics){
        var BLOB_COMPAT = function(blob, url){
                try {
                    blob = new Blob([""], { type: "text/plain" })
                    url = URL.createObjectURL(blob)

                    if ( "msClose" in blob ) // on ie10 (+?), blobs are treated like x-domain files, making them unwritable
                        throw new Error
                } catch(e){
                    return 0
                }

                return 1
            }()

        return {
            constructor: function(args, dict, rules, resolver, resolution){
                args = _.spread(arguments)
                resolver = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                rules = Array.isArray(args[args.length-1]) ? args.pop() : null
                dict = _.typeof(args[args.length-1]) == "object" ? _.invoke(function(dict){

                       }, this, args.pop())
                     : _.typeof(args[args.length-1]) == "string" ? _.invoke(function(str, dict){

                       }, this, args.pop(), {})
                     : args[args.args.length-1] instanceof HTMLElement ? { node: args.pop() }
                     : {}

                resolution = { key: "loading", value: null }
                Object.defineProperty(this, "_state", { get: function(){ return resolution } })

                domReady.then(ondomready.bind(this))

                function ondomready(e){

                }
            }
          , rule: { enumerable: true,
                value: function(rule, callback){

                }
            }
          , media: { enumerable: true,
                value: function(mediaText){

                }
            }
          , disable: { enumerable: true,
                value: function(){

                }
            }
          , enable: { enumerable: true,
                value: function(){

                }
            }

          , state: { enumerable: true, configurable: true,
                get: function(){
                    return (this._state||{}).key
                }
            }
        }
    })

}()

},{"./EventTarget":7,"./Iterator":8,"./class":21,"./domReady":22,"./utils":24}],17:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Stylesheet = require("./Stylesheet").Stylesheet

    module.exports.Transition = klass(function(statics){

        return {
            constructor: function(){
              
            }
        }
    })

}()

},{"./Stylesheet":16,"./class":21,"./utils":24}],18:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.UID = klass(function(statics){
        var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        var MAP = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        var RADIX = 16
        var REGEXP = /[xy]/g

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

},{"./class":21,"./utils":24}],19:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator
    var Model = require("./Model").Model

    module.exports.ZenParser = klass(function(statics){
        var CLASS_LIST_COMPAT = Element.prototype.hasOwnProperty("classList")

        var traversals = Object.create(null, {
                "+": { enumerable: true,
                    value: function sibling(stream, input, output){
                        input.context.parentNode.appendChild(input.buffer)
                    }
                }
              , ">": { enumerable: true,
                    value: function child(stream, input, output){
                        input.context.appendChild(input.buffer)
                    }
                }
              , "^": { enumerable: true,
                    value: function climb(stream, input, output){
                        input.context = input.context.parentNode || input.context
                        traversals["+"](stream, input, output)
                    }
                }
            })

        var operators = Object.create(null, {
                "#": { enumerable: true,
                    value: function(){
                        function write(node, rawId){
                            node.setAttribute("id", module.exports.ZenParser.escapeHTML(rawId))
                        }

                        function set(node, rawId){
                            write(node, rawId)
                        }

                        return function id(stream, input, output){
                            set(input.buffer, input.pile)
                        }
                    }()
                }
              , ".": { enumerable: true,
                    value: function(){
                        function write(node, rawClassName, rawRemoveClassName){
                            if ( rawRemoveClassName )
                              if ( CLASS_LIST_COMPAT )
                                node.classList.remove(module.exports.ZenParser.escapeHTML(rawRemoveClassName))
                              else
                                node.className.replace(module.exports.ZenParser.escapeHTML(rawRemoveClassName), "")

                            if ( CLASS_LIST_COMPAT )
                              node.classList.add(module.exports.ZenParser.escapeHTML(rawClassName))
                            else
                              node.className += " "+module.exports.ZenParser.escapeHTML(rawClassName)
                        }

                        function set(node, rawClassName){
                            write(node, rawClassName)
                        }

                        return function classname(stream, input, output){
                            set(input.buffer, input.pile)
                        }
                    }()
                }
              , "[": { enumerable: true,
                    value: function(){
                        function write(node, rawKey, rawValue){
                            node.setAttribute(module.exports.ZenParser.escapeHTML(rawKey), module.exports.ZenParser.escapeHTML(rawValue))
                        }

                        function set(node, attr, key, value, idx){
                            idx = attr.search("=")

                            if ( idx < 1 )
                              throw new Error("korbut.ZenParser.parse, malformatted attribute substring")

                            key = attr.split("=")[0]
                            value = attr.slice(idx+1)

                            write(node, key, value)
                        }

                        function attribute(stream, input, output){
                            set(input.buffer, input.pile)//[input.pile.length-1] === "]" ? input.pile.slice(0, input.pile.length-1) : input.pile)
                        }

                        attribute.enclosing_glyph = "]"

                        return attribute
                    }()
                }
              , "$": { enumerable: true,
                    value: function assign_var(stream, input, output){
                        output.vars[input.pile] = output.vars[input.pile] || []
                        output.vars[input.pile].push(input.buffer)
                    }
                }
              , "{": { enumerable: true,
                    value: function(){
                        function write(node, rawTextContent){
                            if ( node.nodeType === Node.ELEMENT_NODE )
                              node.appendChild(document.createTextNode(rawTextContent))
                            else if ( node.nodeType === Node.TEXT_NODE )
                              node.nodeValue = rawTextContent
                        }

                        function set(node, rawTextContent){
                            write(node, rawTextContent)
                        }

                        function textContent(stream, input, output, str){
                            set(input.buffer, input.pile)
                        }

                        textContent.enclosing_glyph = "}"

                        return textContent
                    }()
                }
              , "(": { enumerable: true,
                    value: function(){
                        function group(stream, input, output, rv, vars){
                            rv = module.exports.ZenParser.parse(input.pile, input.data)
                            input.buffer = rv.tree.childNodes.length == 1 ? rv.tree.childNodes[0] : rv.tree
                            vars = new Iterator(rv.vars)

                            while ( vars.next(), !vars.current.done ) {
                                output.vars[vars.current.key] = output.vars[vars.current.key] || []

                                while (vars.current.value.length)
                                  output.vars[vars.current.key].push(vars.current.value.shift())
                            }
                        }

                        group.enclosing_glyph = ")"

                        return group
                    }()
                }
            })

        var traverse = function(stream, input, output){
                operate(stream, input, output)

                if ( !input.traversal )
                  input.context = output.tree.appendChild(input.buffer)
                else
                  traversals[input.traversal](stream, input, output)
                input.traversal = input.glyph

                input.pile = ""
                input.glyph = ""
                input.operator = null
                if ( input.buffer && input.buffer.nodeType === Node.ELEMENT_NODE )
                  input.context = input.buffer
                input.buffer = null
            }

        var operate = function(autoVars){
                autoVars = ["A", "INPUT", "SUBMIT", "BUTTON"]
                return function(stream, input, output){
                    input.pile = input.pile.trim()

                    if ( !input.operator) {
                        input.buffer = !input.pile.length && input.glyph === "{" ? document.createTextNode("")
                                     : !input.pile.length && input.glyph !== "{" ? document.createElement("div")
                                     : input.pile === "text" ? document.createTextNode("")
                                     : document.createElement(input.pile)

                      if ( autoVars.indexOf(input.buffer.nodeName) != -1 )
                        input.pile = input.buffer.nodeName.toLowerCase(),
                        operators["$"](stream, input, output)
                    }
                    else
                      operators[input.operator](stream, input, output)

                    input.pile = ""

                    input.operator = input.glyph
                }
            }()

        var parse = function(stream, input, output, capture, ignore, openGlyph, closeGlyph){
                capture = false

                while ( stream.next(), !stream.current.done ) {
                    input.glyph = stream.current.value

                      if ( !capture ) {
                        if ( traversals[input.glyph] )
                          traverse(stream, input, output)
                        else if ( operators[input.glyph] ) {
                            operate(stream, input, output)
                            if ( operators[input.glyph].hasOwnProperty("enclosing_glyph") )
                              capture = true
                              ignore = 0
                              openGlyph = input.glyph
                              closeGlyph = operators[input.glyph].enclosing_glyph
                        }
                        else
                          input.pile += input.glyph
                      } else {
                          if ( input.glyph === closeGlyph && !ignore )
                            capture = false
                          else {
                              if ( input.glyph === closeGlyph )
                                ignore--
                              else if ( input.glyph === openGlyph )
                                ignore++

                              input.pile += input.glyph
                          }
                      }
                }

                traverse(stream, input, output)
                return output
            }

        Object.defineProperties(statics, {
            parse: { enumerable: true,
                value: function(expression, data){
                    return new module.exports.ZenParser(expression).parse(data)
                }
            }
          , escapeHTML: { enumerable: true,
                value: function(dummy){
                    return function(str){
                        dummy.nodeValue = str
                        return dummy.nodeValue
                    }
                }( document.createTextNode("") )
            }
        })

        return {
            constructor: function(expression){
                Object.defineProperty(this, "_expression", {
                    value: _.typeof(expression) == "string" ? expression : ""
                })
            }
          , parse: { enumerable: true,
                value: function(data, stream, input, output){
                    stream = new Iterator(this.expression)
                    input = { data: data, pile: "", glyph: "", buffer: null, operator: null, traversal: null, context: null }
                    output = { vars: {}, tree: document.createDocumentFragment() }

                    return parse(stream, input, output)
                }
            }
          , expression: { enumerable: true,
                get: function(){
                    return this._expression || ""
                }
            }
        }
    })

    module.exports.View = klass(function(statics){
        Object.defineProperties(statics, {

        })

        return {
            constructor: function(args, handler, data, dict, expression, buffer){
                args = _.spread(arguments)
                handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                data = Model.isImplementedBy(args[args.lenght-1]) ? args.pop()
                     : args.length > 1 && "string, object".indexOf(_.typeof(args[args.length-1])) != -1 ? new this.Model(args.pop())
                     : new this.Model
                dict = _.typeof(args[args.length-1]) == "string" ? { template: args.pop() }
                     : _.typeof(args[args.length-1]) == "object" ? args.pop()
                     : {}

                expression = _.typeof(dict.template) == "string" ? dict.template : ""
                buffer = new this.Template(expression).parse(this)

                Object.defineProperties(this, {
                    _template: { value: expression }
                  , _model: { value: data }
                  , _vars: { value: buffer.vars }
                  , _fragment: { value: buffer.tree }
                  , _DOMEvents: { value: _.typeof(dict.events) == "object" ? dict.events : {} }
                })

                this.addDOMEventListener(this.DOMEvents)
            }
          , render: { enumerable: true,
                value: function(){
                    return this._fragment
                }
            }
          , element: { enumerable: true,
                value: function(){

                }
            }
          , addDOMEventListener: { enumerable: true,
                value: function(){

                }
            }
          , removeDOMEventListener: { enumerable: true,
                value: function(){

                }
            }

          , clone: { enumerable: true,
                value: function(){

                }
            }

          , model: { enumerable: true,
                get: function(){
                    return this._model
                }
            }
          , template: { enumerable: true,
                get: function(){
                    return this._template
                }
            }
          , DOMEvents: { enumerable: true,
                get: function(){
                    return this._DOMEvents || {}
                }
            }

          , Model: {
                enumerable: true,
                get: function(){
                    return this._Model || Model
                }
            }
          , Template: { enumerable: true,
                get: function(){
                    return this._Template || module.exports.ZenParser
                }
            }
        }

    })

}()

},{"./Iterator":8,"./Model":9,"./class":21,"./utils":24}],20:[function(require,module,exports){
void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Model = require("./Model").Model

    module.exports.WebStore = klass(Model, function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()

},{"./Model":9,"./class":21,"./utils":24}],21:[function(require,module,exports){
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
        Object.defineProperty(prototype, "constructor", { value: Class, configurable: true, enumerable: true })

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
                if ( !o )
                  return false

                prototype = o && typeof o.constructor == "function" ? o.constructor.prototype : null

                if ( o instanceof Class )
                  return true

                for ( k in Class.prototype )
                  if ( k != "constructor" && function(o, c, err){
                      err = !o || !c ? true : false

                      if ( o )
                        if ( c.configurable ) {
                          if ( c.hasOwnProperty("value") && typeof o.value != typeof c.value )
                            err = true
                        } else {
                          if ( c.hasOwnProperty("value") && o.value !== c.value )
                            err = true
                          if ( c.hasOwnProperty("get") && o.get !== c.get )
                            err = true
                          if ( c.hasOwnProperty("set") && o.set !== c.set )
                            err = true
                        }

                      return err
                  }( Object.getOwnPropertyDescriptor(prototype, k), Object.getOwnPropertyDescriptor(Class.prototype, k) ) ) return false
                return true
            }
        })

        !Class.hasOwnProperty("extend") && Object.defineProperty(Class, "implementsOn", {
            enumerable: true,
            value: function(o, prototype, properties){
                prototype = _.typeof(o) == "function" ? o.prototype : {}
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

},{"./utils":24}],22:[function(require,module,exports){
void function(){ "use strict"

    var Promise = require("./Promise").Promise
    var klass = require("./class").class
    var Event = require("./Event").Event
    var DomReadyEvent = klass(Event, {
            constructor: function(){
                Event.call(this, "domReady")

                Object.defineProperties(this, {
                    nodes: { enumerable: true,
                        value: {
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
                    }
                })

            }
        })

    module.exports = new Promise(function(resolve, reject, ready){
        function onready(){
            if ( ready )
              return
            ready = true

            setTimeout(resolve, 4, new DomReadyEvent())
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

},{"./Event":6,"./Promise":11,"./class":21}],23:[function(require,module,exports){
void function(ns){ "use strict"

    var domReady = require("./domReady")
    var korbut = function(cb){
            if ( typeof cb == "function" )
              domReady.then(cb.bind(null))
        }

    Object.defineProperties(korbut, {
        utils: { enumerable: true, value: require("./utils") }
      , class: { enumerable: true, value: require("./class").class }
      , singleton: { enumerable: true, value: require("./class").singleton }

      , Iterator: { enumerable: true, value: require("./Iterator").Iterator }

      , EventTarget: { enumerable: true, value: require("./EventTarget").EventTarget }
      , Event: { enumerable: true, value: require("./Event").Event }

      , CustomEvent: { enumerable: true, value: require("./CustomEvent").CustomEvent }
      , PointerEvent: { enumerable: true, value: require("./PointerEvent").PointerEvent }

      , Promise: { enumerable: true, value: require("./Promise").Promise }

      , Router: { enumerable: true, value: require("./Router").Router }
      , Route: { enumerable: true, value: require("./Route").Route }

      , Service: { enumerable: true, value: require("./Service").Service }

      , View: { enumerable: true, value: require("./View").View }
      , ZenParser: { enumerable: true, value: require("./View").ZenParser }
      , Stylesheet: { enumerable: true, value: require("./Stylesheet").Stylesheet }
      , Transition: { enumerable: true, value: require("./Transition").Transition }
      , Animation: { enumerable: true, value: require("./Animation").Animation }
      , ClientRect: { enumerable: true, value: require("./ClientRect").ClientRect }

      , Model: { enumerable: true, value: require("./Model").Model }
      , Collection: { enumerable: true, value: require("./Collection").Collection }
      , Cookie: { enumerable: true, value: require("./Cookie").Cookie }
      , WebStore: { enumerable: true, value: require("./WebStore").WebStore }

      , UID: { enumerable: true, value: require("./UID").UID }
      , Serializer: { enumerable: true, value: require("./Serializer").Serializer }
    })

    window.korbut = korbut

}( { version: "korbutJS-ES5-0.0.1-1400353686098" } )

},{"./Animation":1,"./ClientRect":2,"./Collection":3,"./Cookie":4,"./CustomEvent":5,"./Event":6,"./EventTarget":7,"./Iterator":8,"./Model":9,"./PointerEvent":10,"./Promise":11,"./Route":12,"./Router":13,"./Serializer":14,"./Service":15,"./Stylesheet":16,"./Transition":17,"./UID":18,"./View":19,"./WebStore":20,"./class":21,"./domReady":22,"./utils":24}],24:[function(require,module,exports){
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

    module.exports.invoke = function(fn, ctx, args){
        fn = typeof fn == "function" ? fn : function(){ throw new TypeError("korbut.utils.invoke - function expected as argument 0") }()
        ctx = arguments[1] || null
        args = arguments.length == 3 && Array.isArray(args) ? args
             : module.exports.spread(arguments, 2)

        switch ( args.length ) {
            case 0:
              return Function.prototype.call.call(fn, ctx)
            case 1:
              return Function.prototype.call.call(fn, ctx, args[0])
            case 2:
              return Function.prototype.call.call(fn, ctx, args[0], args[1])
            case 3:
              return Function.prototype.call.call(fn, ctx, args[0], args[1], args[2])
            default:
              return Function.prototype.apply.call(fn, ctx, args)
        }
    }

}()

},{}]},{},[23])