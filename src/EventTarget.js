void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var UID = require("./UID").UID

    module.exports.Event = klass(function(statics){

        return {
            constructor: function(type, detail){
                type = _.typeof(type) == "string" ? type : function(){ throw new Error("Event.type") }() //TODO
                detail = function(detail){
                    return detail.length == 1 && _typeof(detail[0]) == "object" && detail[0].hasOwnProperty("detail") ? Object.create(detail[0])
                         : null
                }( _.spread(arguments, 1) )

                this.type = type
                this.detail = detail
                this.timestamp = Date.now()
            }
          , initEvent: {
                value: function(){
                    return this.constructor.apply(this, arguments)
                }
            }
          , type: { enumerable: true,
                get: function(){ return this._type }
              , set: function(v){ !this._type && Object.defineProperty(this, "_type", { value: v }) }
            }
          , detail: { enumerable: true,
                get: function(){ return this._detail }
              , set: function(v){ this._detail === void 0 && Object.defineProperty(this, "_detail", { value: v }) }
            }
          , timestamp: { enumerable: true,
                get: function(){ return this._timestamp }
              , set: function(v){ !this._timestamp && Object.defineProperty(this, "_timestamp", { value: v }) }
            }
        }
    })

    module.exports.EventTarget = klass(function(statics){
        var eventTargets = Object.create(null)

        Object.defineProperties(statics, {
            isEventListener: { enumerable: true,
                value: function(o){
                    return o && (typeof o == "function" || typeof o.handleEvent == "function")
                }
            }
          , getByUid: { enumerable: true,
                value: function(uid){ return eventTargets[uid] ? eventTargets[uid].view : void 0 }
            }
        })

        return {
            events: { enumerable: true,
                get: function(){
                    return eventTargets[this.uid] ? eventTargets[this.uid].events : function(){
                        eventTargets[this.uid] = Object.create(null, {
                            view: { value: this }
                          , events: { value: Object.create(null) }
                        })

                        return this.events
                    }.call(this)
                }
            }
          , addEventListener: { enumerable: true,
                value: function(type, handler, handlers){
                    //!this._events && Object.defineProperty(this, "_events", { value: Object.create(null) })

                    if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                      return function(events, count, k){
                          count = 0

                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            count += this.addEventListener(k, events[k])

                          return count
                      }.call( this, arguments[0] )

                    type = _.typeof(type) == "string" ? type : null
                    handler = statics.isEventListener(handler) ? handler : null
                    handlers = this.events[type]

                    if ( !type || !handler )
                      return 0

                    if ( _.typeof(handlers) == "array" )
                      handlers.push(handler)
                    else if ( !handlers )
                      this.events[type] = handler
                    else if ( statics.isEventListener(handlers) )
                      this.events[type] = [handlers, handler]

                    return 1
                }
            }
          , removeEventListener: { enumerable: true,
                value: function(type, handler, handlers){
                    //!this._events && Object.defineProperty(this, "_events", { value: Object.create(null) })

                    if ( arguments.length == 1 && arguments[0] && _.typeof(arguments[0]) == "object" )
                      return function(events, count, k){
                          count = 0

                          for ( k in events ) if ( events.hasOwnProperty(k) )
                            count += this.removeEventListener(k, events[k])

                          return count
                      }.call( this, arguments[0] )

                    type = _.typeof(type) == "string" ? type : null
                    handler = statics.isEventListener(type) || type == "*" ? type : null
                    handlers = this.events[type]

                    if ( !type || !handler || !handlers )
                      return 0

                    if ( handlers === handler ) {
                        delete this.events[type]
                        return 1
                    }

                    if ( Array.isArray(handlers) )
                      return function(copy, idx, count){
                          if ( handler === "*" ) {
                              count = handlers.length
                              delete this.events[type]

                              return count
                          }

                          count = 0

                          while ( idx = copy.indexOf(handler) > -1 )
                            copy.splice(idx, 1), count++

                          this.events[type] = copy

                          if ( this.events[type].length == 0 )
                            delete this.events[type]

                          return count
                      }.call( this, [].concat(handlers) )
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
                    handlers = (this.events||{})[event.type]
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
                get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
            }

          , purge: { enumerable: true, configurable: true,
                value: function(){ delete eventTargets[this.uid] }
            }
        }
    })

}()
