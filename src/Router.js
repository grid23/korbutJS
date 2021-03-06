"use strict"

var _ = require("./utils")
var klass = require("./class").class
var EventTarget = require("./EventTarget").EventTarget
var Iterator = require("./Iterator").Iterator
var Promise = require("./Promise").Promise
var Route = require("./Route").Route
var UID = require("./UID").UID

module.exports.Router = klass(EventTarget, function(statics){
    var routers = Object.create(null)

    Object.defineProperties(statics, {
        getByUid: { enumerable: true,
            value: function(uid){ return routers[uid] ? routers[uid].router : void 0 }
        }
      , dispatcher: { enumerable: true,
            value: function(cache){
                function getRule(str, regexp, nregexp, assignments, split, nsplit, join, pile, i, l){
                    if ( !cache[str] )
                      if ( str.indexOf(":") == -1 )
                        cache[str] = new RegExp("^"+str+"$", "i")
                      else {
                        assignments = []
                        //regexp = []
                        nregexp = []

                        //split = str.split(/\/|\.(?=:)/)

                        nsplit = []
                        join = []

                        pile = ""

                        for ( i = 0, l = str.length; i<=l; i++)
                          void function(char){
                              if ( i === l ) {
                                  if ( pile.length )
                                    nsplit.push(pile)
                              }
                              else if ( char === "/")
                                nsplit.push(pile),
                                join.push(char),
                                pile = ""
                              else if ( char === "." && str[i+1] === ":" )
                                nsplit.push(pile),
                                join.push(char),
                                pile = ""
                              else
                                pile += char
                          }( str[i] )

                        while ( nsplit.length )
                          void function(part, match, joiner){
                              joiner = join.shift()
                              if ( part[0] === ":" ) {

                                if ( match = part.match(/^:(\w+)(\(.*\))$/), match ) {
                                  assignments.push(match[1])
                                  nregexp.push(match[2])
                                } else {
                                  assignments.push(part.slice(1))
                                  //regexp.push("([^\\\/]*)")
                                  nregexp.push("([^\\"+(joiner||"\/")+"]*)")
                                }

                              } else {
                                //regexp.push(part)
                                nregexp.push(part)
                              }

                              joiner && nregexp.push("(?:\\"+joiner+")")
                          }( nsplit.shift() )

                        //cache[str] = new RegExp("^"+regexp.join("(?:\\\/|\\\.)")+"$", "i")
                        cache[str] = new RegExp("^"+nregexp.join("")+"$", "i")
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
        constructor: function(routes, dict, dispatcher, args){
            args = _.spread(arguments)
            dispatcher = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
            dict = args.length > 1 && _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
            routes = args.shift()

            routers[this.uid] = Object.create(null, {
                router: { value: this }
              , routes: { value: Object.create(null) }
              , Route: { writable: true,
                    value : Route.isImplementedBy(this._Route) ? this._Route
                          : Route.isImplementedBy(dict.Route) ? dict.Route
                          : Route
                }
            })

            if ( _.typeof(routes) == "object" )
              this.addRouteHandler(routes)

            if ( dispatcher )
              dispatcher.call(this, function dispatch(){
                  return this.dispatch.apply(this, arguments)
              }.bind(this))
        }
      , Route: { enumerable: true,
            get: function(){ return routers[this.uid].Route }
          , set: function(v){ if ( Route.isImplementedBy(v) ) routers[this.uid].Route = v }
        }
      , routes: { enumerable: true,
            get: function(){ return routers[this.uid].routes }
        }
      , addRouteHandler: { enumerable: true,
            value: function(route, handler, handlers){
                //!this._routes && Object.defineProperty(this, "_routes", { value: Object.create(null) })

                if ( arguments.length > 1 && _.typeof(arguments[0]) == "array" )
                  return function(routes, count){
                      count = 0

                      while (routes.length)
                        count += this.addRouteHandler(routes.shift(), handler)

                      return count
                  }.call(this, [].concat(arguments[0]))

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
    , dispatchRouteAsync: { enumerable: true,
            value: function(route, iterator, emitter, dispatch){
                route = Route.isImplementedBy(route) ? route : this.Route.create.apply(null, arguments)
                iterator = function(routes, copy, keys){
                    keys = Object.keys(routes).sort()

                    while ( keys.length )
                      copy[keys[0]] = routes[keys.shift()]

                    return new Iterator(copy)
                }( this.routes || Object.create(null), [] )


                dispatch = new Promise(function(resolve, reject, self, hits, hit, rv){
                  self = this
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

                                  if (_.typeof(counts) == "boolean" && !counts && iteration.key !== "*" )
                                      hits--
                                  if (_.typeof(counts) == "boolean" && !!counts && iteration.key === "*" )
                                      hits++

                                  if ( iteration.key !== "*" )
                                    hits++ // natural hit

                                  rv = (handler.handleRoute||handler).call(!handler.handleRoute?null:handler, route, handlers.length?_next:next, hits)

                                  return _.typeof(rv) !== "undefined" ? rv : hits
                              }

                              return _next()
                          }( [].concat(iteration.value) )
                  }


                  function next(counts){
                      if (_.typeof(counts) == "boolean" && !counts && iterator.current.key !== "*" )
                          hits--
                      if (_.typeof(counts) == "boolean" && !!counts && iterator.current.key === "*" )
                          hits++

                      iterator.next()
                      if ( iterator.current.done == true )
                        return resolve(hits)

                      hit = iterator.current.key === "*" ? true
                          : !!self.dispatcher.call(self, route, iterator.current.key)

                      if ( !hit )
                        next()
                      else
                        handle(iterator.current)
                  }

                  next()
                }.bind(this))

                dispatch.catch(function(e){
                    console.error(e)
                })

                return dispatch
            }
        }
      , dispatchRoute: { enumerable: true,
            value: function(route, iterator){
                route = Route.isImplementedBy(route) ? route : this.Route.create.apply(null, arguments)
                iterator = function(routes, copy, keys){
                    keys = Object.keys(routes).sort()

                    while ( keys.length )
                      copy[keys[0]] = routes[keys.shift()]

                    return new Iterator(copy)
                }( this.routes || Object.create(null), [] )

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

                                    if (_.typeof(counts) == "boolean" && !counts && iteration.key !== "*" )
                                        hits--
                                    if (_.typeof(counts) == "boolean" && !!counts && iteration.key === "*" )
                                        hits++

                                    if ( iteration.key !== "*" )
                                      hits++ // natural hit

                                    rv = (handler.handleRoute||handler).call(!handler.handleRoute?null:handler, route, handlers.length?_next:next, hits)
                                    return _.typeof(rv) !== "undefined" ? rv : hits
                                }

                                return _next()
                            }( [].concat(iteration.value) )
                    }

                    function next(counts){
                        if (_.typeof(counts) == "boolean" && !counts && iterator.current.key !== "*" )
                            hits--
                        if (_.typeof(counts) == "boolean" && !!counts && iterator.current.key === "*" )
                            hits++

                        iterator.next()
                        if ( iterator.current.done == true )
                          return hits

                        hit = iterator.current.key === "*" ? true
                            : !!self.dispatcher.call(self, route, iterator.current.key)

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
            value : function(){
                return this._dispatcher ? this._dispatcher.apply(this, arguments)
                     : module.exports.Router.dispatcher.apply(this, arguments)
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
