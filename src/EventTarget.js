void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.Event = klass(function(statics){

        return {
            constructor: function(type, detail){
                type = _.typeof(type) == "string" ? type : function(){ throw new Error("Event.type") }() //TODO
                detail = function(detail){
                    return !detail.length || (detail.length == 1 && "undefined, null".indexOf(_.typeof(detail[0])) != -1 ) ? null
                         : detail.length == 1 && _typeof(detail[0]) == Object && detail[0].hasOwnProperty("detail") ? detail[0].detail
                         : detail.length == 1 ? detail[0]
                         : detail
                }( _.spread(arguments, 1) )

                Object.defineProperties(this, {
                    "_type": { value: type }
                  , "_detail": { value: Object.create(detail) }
                  , "_timestamp": { value: Date.now() }
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
          , detail: { enumerable: true,
                get: function(){
                    return this._detail
                }
            }
          , timestamp: { enumerable: true,
                get: function(){
                      return this._timestamp
                }
            }
        }
    })

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

                    if ( arguments.length == 1 && arguments[0] && _.typeof(arguments[0]) == Object )
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

                    if ( arguments.length == 1 && arguments[0] && _.typeof(arguments[0]) == Object )
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
                    event = module.exports.Event.isImplementedBy(event) ? event : module.exports.Event.create.apply(null, arguments)
                    handlers = (this._events||{})[event.type]
                    count = 0

                    if ( event.type == "error" && !handlers )
                      throw module.exports.Event.isImplementedBy(event.detail) ? event.detail : new Error

                    if ( handlers )
                      if ( typeof handlers == "function" )
                        handlers.call(null, event), count++
                      else if ( Array.isArray(handlers) )
                        void function(handlers){
                            while ( handlers.length )
                              if ( typeof handlers[0] == "function" )
                                handlers.shift().call(null, event), count++
                              else if ( typeof handlers[0].handleEvent == "function" )
                                handlers.shift().handleEvent.call(handlers, event), count++
                              else
                                handlers.shift()
                        }( [].concat(handlers) )
                      else if ( typeof handlers.handleEvent == "function" )
                        handlers.handleEvent.call(handlers, event), count++

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
