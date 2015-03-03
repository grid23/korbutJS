"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Iterator = require("./Iterator").Iterator
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

module.exports.EventTarget = klass(function(statics){
    var eventTargets = Object.create(null)

    Object.defineProperties(statics, {
        isEventListener: { enumerable: true,
            value: function(o){
                return !!o && (typeof o == "function" || typeof o.handleEvent == "function")
            }
        }
      , getByUid: { enumerable: true,
            value: function(uid){ return eventTargets[uid] ? eventTargets[uid].eventTarget : void 0 }
        }
    })

    return {
        Event: { enumerable: true,
            get: function(){ return this._Event || module.exports.Event }
        }
      , events: { enumerable: true,
            get: function(){
                return eventTargets[this.uid] ? eventTargets[this.uid].events : function(){
                    eventTargets[this.uid] = Object.create(null, {
                        eventTarget: { value: this }
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
            value: function(type, handler, handlers, count, copy){
                if ( arguments.length == 1 && arguments[0] && _.typeof(arguments[0]) == "object" )
                  return function(events, count, k){
                      count = 0

                      for ( k in events ) if ( events.hasOwnProperty(k) )
                        count += this.removeEventListener(k, events[k])

                      return count
                  }.call( this, arguments[0] )

                type = _.typeof(type) == "string" ? type : null
                handler = (statics.isEventListener(handler) || handler == "*") ? handler : null
                handlers = this.events[type]
                count = 0

                if ( !type || !handler || !handlers )
                  return 0

                if ( handler === "*" ) {
                  count = _.typeof(handlers) == "array" ? handlers.length : !!handlers ? 1 : 0

                  delete this.events[type]
                  return count
                }
                else if ( handlers === handler ) {
                    delete this.events[type]
                    return 1
                }
                else if ( _.typeof(handlers) == "array" ) {
                  copy = [].concat(handlers)

                  void function seek(i, l){
                      for ( i = 0, l = copy.length; i < l; i++ )
                        if ( copy[i] === handler ) {
                            copy.splice(i, 1), count += 1
                            return seek()
                        }
                  }.call(this)

                  this.events[type] = copy

                  if ( this.events[type].length == 0 )
                    delete this.events[type]
                }

                return count
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
                event = module.exports.Event.isImplementedBy(event) ? event : this.Event.create.apply(null, arguments)
                handlers = (this.events||{})[event.type]
                count = 0

                if ( event.type == "error" && !handlers )
                  throw module.exports.Event.isImplementedBy(event.detail) ? event.detail : new Error

                if ( handlers )
                  if ( typeof handlers == "function" )
                    handlers.call(null, event), count++
                  else if ( typeof handlers.handleEvent == "function" )
                    handlers.handleEvent.call(handlers, event), count++
                  else if ( Array.isArray(handlers) )
                    void function(handlers){
                        while ( handlers.length )
                          if ( typeof handlers[0] == "function" )
                            handlers.shift().call(null, event), count++
                          else if ( typeof handlers[0].handleEvent == "function" )
                            handlers[0].handleEvent.call(handlers.shift(), event), count++
                          else
                            handlers.shift()
                    }( [].concat(handlers) )

                return count
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || function(){
                      eventTargets[ Object.defineProperty(this, "_uid", { value: UID.uid() })._uid ] = Object.create(null, {
                          eventTarget: { value: this }
                        , events: { value: Object.create(null) }
                      })

                      return this.uid
                  }.call(this)
            }
        }


      , purge: { enumerable: true, configurable: true,
            value: function(){ delete eventTargets[this.uid] }
        }
    }
})
