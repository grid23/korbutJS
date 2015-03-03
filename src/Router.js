"use strict"

var _ = require("./utils")
var klass = require("./class").class
var EventTarget = require("./EventTarget").EventTarget
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
              , detail: { value: detail }
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

module.exports.Router = klass(EventTarget, function(statics){
    var routers = Object.create(null)

    Object.defineProperties(statics, {
        getByUid: { enumerable: true,
            value: function(uid){ return routers[uid] ? routers[uid].router : void 0 }
        }
      , dispatcher: { enumerable: true,
            value: function(cache){
                function getRule(str, regexp, assignments, split){
                    if ( !cache[str] )
                      if ( str.indexOf(":") == -1 )
                        cache[str] = new RegExp("^"+str+"$")
                      else {
                        assignments = []
                        regexp = []
                        split = str.split("/")

                        while ( split.length )
                          void function(part, match){
                              if ( part[0] === ":" ) {

                                if ( match = part.match(/^:(\w+)(\(.*\))$/), match ) {
                                  assignments.push(match[1])
                                  regexp.push(match[2])
                                } else {
                                  assignments.push(part.slice(1)),
                                  regexp.push("([^\\\/]*)")
                                }

                              } else
                                regexp.push(part)
                          }( split.shift() )

                        cache[str] = new RegExp("^"+regexp.join("\\\/")+"$")
                        cache[str].assignments = assignments
                      }

                    return cache[str]
                }

                return function(route, path, rule, match){
                    rule = getRule(path)
                    match = route.path.match(rule)

                    if ( !match )
                      return false

                    if ( match.length == 1 || !rule.assignments )
                      return true

                    return function(i, l){
                        for ( ; i < l; i++ )
                          route.matches[rule.assignments[i]] = match[i+1]

                        return route
                    }(0, rule.assignments.length)
                }
            }( Object.create(null) )
        }
      , "isRouteHandler": { enumerable: true,
            value: function(o){
                return !!o && (typeof o == "function" || typeof o.handleRoute == "function")
            }
        }
    })

    return {
        constructor: function(routes, dispatcher){
            routers[this.uid] = Object.create(null, {
                router: { value: this }
              , routes: { value: Object.create(null) }
              , Route: { value: this.constructor.prototype._Route || module.exports.Route }
            })

            if ( _.typeof(routes) == "object" )
              this.addRouteHandler(routes)

            if ( typeof dispatcher == "function" )
              dispatcher.call(this, function dispatch(){
                  return this.dispatch.apply(this, arguments)
              }.bind(this))
        }
      , Route: { enumerable: true,
            get: function(){ return routers[this.uid].Route }
        }
      , routes: { enumerable: true,
            get: function(){ return routers[this.uid].routes }
        }
      , addRouteHandler: { enumerable: true,
            value: function(route, handler, handlers){
                //!this._routes && Object.defineProperty(this, "_routes", { value: Object.create(null) })

                if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                  return function(routes, count, k){
                      count = 0

                      for ( k in routes ) if ( routes.hasOwnProperty(k) )
                        count += this.addRouteHandler(k, routes[k])

                      return count
                  }.call( this, arguments[0] )

                route = _.typeof(route) == "string" ? route : null
                handler = statics.isRouteHandler(handler) ? handler : null
                handlers = this.routes[route]

                if ( !route || !handler )
                  return 0

                if ( _.typeof(handlers) == "array" )
                  handlers.push(handler)
                else if ( !handlers )
                  this.routes[route] = handler
                else if ( statics.isRouteHandler(handlers) )
                  this.routes[route] = [handlers, handler]

                return 1
            }
        }
      , removeRouteHandler: { enumerable: true,
            value: function(route, handler, handlers, count, copy){
                if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                  return function(routes, count, k){
                      count = 0

                      for ( k in routes ) if ( routes.hasOwnProperty(k) )
                        count += this.removeRouteHandler(k, routes[k])

                      return count
                  }.call(this, arguments[0])

                route = _.typeof(route) == "string" ? route : null
                handler = (statics.isRouteHandler(handler) || handler == "*") ? handler : null
                handlers = this.routes[route]
                count = 0

                if ( !route || !handler || !handlers )
                  return 0

                if ( handler === "*" ) {
                  count = _.typeof(handlers) == "array" ? handlers.length : !!handlers ? 1 : 0

                  delete this.routes[route]
                  return count
                }
                else if ( handlers === handler ) {
                    delete this.routes[route]
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

                  this.routes[route] = copy

                  if ( this.routes[route].length == 0 )
                    delete this.routes[route]
                }

                return count
            }
        }
      , dispatchRoute: { enumerable: true,
            value: function(route, iterator){
                route = module.exports.Route.isImplementedBy(route) ? route : this.Route.create.apply(null, arguments)
                iterator = function(routes, copy, keys){
                    keys = Object.keys(routes).sort()

                    while ( keys.length )
                      copy[keys[0]] = routes[keys.shift()]

                    return new Iterator(copy)
                }( this.routes || Object.create(null), Object.create(null) )

                return function(self, hits, hit, rv){
                    hits = 0

                    function handle(iteration){
                        if ( statics.isRouteHandler(iteration.value) ) {
                          if ( iteration.key !== "*" )
                            hits++

                          rv = (iteration.value.handleRoute||iteration.value).call(!iteration.value.handleRoute?null:iteration.value, route, next, hits)
                          return _.typeof(rv) !== "undefined" ? rv : hits
                        } else if ( Array.isArray(iteration.value) )
                            return function(handlers, _next){
                                function _next(counts, handler){
                                    if ( !handlers.length )
                                      return next.call(null, counts)

                                    handler = handlers.shift()

                                    if ( iteration.key !== "*" )
                                      hits++

                                    rv = (handler.handleRoute||handler).call(!handler.handleRoute?null:handler, route, handlers.length?_next:next, hits)
                                    return _.typeof(rv) !== "undefined" ? rv : hits
                                }

                                return _next()
                            }( [].concat(iteration.value) )
                    }

                    function next(counts){
                        if ( _.typeof(counts) == "boolean" ){
                            if ( !counts && iterator.current.key !== "*" )
                              hits--
                            else if ( counts && iterator.current.key == "*" )
                              hits++
                        }

                        iterator.next()

                        if ( iterator.current.done == true )
                          return hits

                        hit = iterator.current.key === "*" ? true
                            : !!self.dispatcher.call(this, route, iterator.current.key)

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
                return this._dispatcher || module.exports.Router.dispatcher
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                delete routers[this.uid]
            }
        }

    }
})
