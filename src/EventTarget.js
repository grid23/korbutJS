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
