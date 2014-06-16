void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID

    module.exports.Route = klass(function(statics){

        return {
            constructor: function(path, detail){
                path = _.typeof(path) == "string" ? path : function(){ throw new Error("Route.path") }() //TODO
                detail = function(detail){
                    return !detail.length || (detail.length == 1 && "undefined, null".indexOf(_.typeof(detail[0])) != -1 ) ? null
                         : detail.length == 1 && _.typeof(detail[0]) == "object" && detail[0].hasOwnProperty("detail") ? detail[0].detail
                         : detail.length == 1 ? detail[0]
                         : detail
                }( _.spread(arguments, 1) )

                Object.defineProperties(this, {
                    "_path": { value: path }
                  , "_detail": { value: Object.create(detail) }
                  , "_timestamp": { value: Date.now() }
                  , "_matches": { value: {} }
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

    module.exports.Router = klass(EventTarget, function(statics){
        var routers = Object.create(null)

        Object.defineProperties(statics, {
            getByUid: function(uid){
                return routers[uid] ? routers[uid].router : void 0
            }
          , dispatcher: { enumerable: true,
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
                  dispatcher.call(this, function dispatch(){
                      return this.dispatch.apply(this, arguments)
                  }.bind(this))
            }
          , routes: { enumerable: true,
                get: function(){
                    return routers[this.uid] ? routers[this.uid].routes : function(){
                        routers[this.uid] = Object.create(null, {
                            router: { value: this }
                          , routes: { value: Object.create(null) }
                        })

                        return this.routes
                    }.call(this)
                }

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
                value: function(route, handler){
                    //!this._routes && Object.defineProperty(this, "_routes", { value: Object.create(null) })

                    if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                      return function(routes, count, k){
                          count = 0

                          for ( k in routes ) if ( routes.hasOwnProperty(k) )
                            count += this.removeRouteHandler(k, routes[k])

                          return count
                      }.call(this, arguments[0])

                    route = _.typeof(route) == "string" ? route : null
                    handler = statics.isRouteHandler(route) || route == "*" ? route : null
                    handlers = this.routes[route]

                    if ( !route || !handler || !handlers )
                      return 0

                    if ( handlers === handler ) {
                        delete this.routes[route]
                        return 1
                    }

                    if ( Array.isArray(handlers) )
                      return function(copy, idx, count){
                          if ( handler === "*" ) {
                              count = handlers.length
                              delete this.routes[route]

                              return count
                          }

                          count = 0

                          while ( idx = copy.indexOf(handler) > -1 )
                            copy.splice(idx, 1), count++

                          this.routes[route] = copy

                          if ( this.routes[route].length == 0 )
                            delete this.routes[route]

                          return count
                      }.call( this, [].concat(handlers) )
                }
            }
          , dispatchRoute: { enumerable: true,
                value: function(route, iterator){
                    route = module.exports.Route.isImplementedBy(route) ? route : module.exports.Route.create.apply(null, arguments)
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
                    return this._dispatcher || module.exports.Router.dispatcher
                }
            }

          , uid: { enumerable: true, configurable: true,
                get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid()})._uid }
            }

          , purge: { enumerable: true, configurable: true,
                value: function(){
                    EventTarget.prototype.purge.call(this)
                    delete routers[this.uid]
                }
            }

        }
    })

}()
