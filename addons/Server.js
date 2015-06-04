"use strict"

const path = require("path")
const ROOT_PATH = path.resolve(process.cwd(), path.dirname(require.main.filename || __filename) , "./")

const http = require("http")
const url = require("url")

const klass = require("../src/class").class
const type = require("../src/utils").typeof

const Event = require("../src/EventTarget").Event
const EventTarget = require("../src/EventTarget").EventTarget

const Route = require("../src/Router").Route
const Router = require("../src/Router").Router

const routes = new WeakMap
const servers = new WeakMap

module.exports.HTTPRequestRoute = klass(Route, {
    constructor: function(request, response, path){
        path = ["/", request.method, url.parse(request.url).pathname.toLowerCase()].join("")

        Route.call(this, path, { request: request, response: response })
        routes.set(this, Object.create(null))
    }
})

module.exports.HTTPCatchAllRoute = klass(Route, {
    constructor: function(request, response){
        Route.call(this, "catchall", { request: request, response: response })

        routes.set(this, Object.create(null))
    }
})

module.exports.Server = klass(Router, function(statics){
    Object.defineProperties(statics, {
        HTTPRequestRoute: { enumerable: true,
            get: function(){
                return module.exports.HTTPRequestRoute
            }
        }
      , HTTPCatchAllRoute: { enumerable: true,
            get: function(){
                return module.exports.HTTPCatchAllRoute
            }
        }
    })

    return {
        constructor: function(){
            Router.apply(this, arguments)

            servers.set(this, Object.create(null))
            servers.get(this).server = new http.Server

            this.Route = module.exports.HTTPRequestRoute

            servers.get(this).server.on("request", function(request, response, hit){
                if ( hit = this.dispatchRoute(new this.Route(request, response)), !hit )
                  if ( hit = this.dispatchRoute(new this.CachAllRoute(request, response)), !hit )
                    response.writeHead("404"), response.end()
            }.bind(this))
        }
      , listen: { enumerable: true,
            value: function(){
                return http.Server.prototype.listen.apply(servers.get(this).server, arguments)
            }
        }

      , server: { enumerable: true,
            get: function(){ return servers.get(this).server }
        }
      , CatchAllRoute: { enumerable: true,
            get: function(){ return servers.get(this).CatchAllRoute || module.exports.HTTPCatchAllRoute }
          , set: function(V){
                if ( Route.isImplementedBy(V) && type(V) == "function" )
                  servers.get(this).CatchAllRoute = V
            }
        }
      , purge: { enumerable: true,
            value: function(){
                Router.prototype.purge.call(this)
                servers.get(this).server.close()
                servers.delete(this)
            }
        }
    }
})
