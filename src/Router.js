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

                        function next(iteration){
                            iteration = iterator.next()

                            if ( iteration.done == true )
                              return hits

                            hit = iteration.key === "*" ? true
                                : self.dispatcher.call(this, route, iteration.key)

                            if ( !hit )
                              return next()
                            return handle(iteration)
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
