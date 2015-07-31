"use strict"

const path = require("path")
const ROOT_PATH = path.resolve(process.cwd(), path.dirname(require.main.filename || __filename) , "./")

const fs = require("fs")
const http = require("http")
const https = require("https")

const klass = require("../class").class
const objectify = require("../Serializer").Serializer.objectify
const parse = require("url").parse
const spread = require("../utils").spread
const type = require("../utils").typeof

const Event = require("../Event").Event
const EventTarget = require("../EventTarget").EventTarget

const Route = require("../Route").Route
const Router = require("../Router").Router

const routes = new WeakMap
const servers = new WeakMap


module.exports.HTTPRequestRoute = klass(Route, {
    constructor: function(request, response, path, query, fullpath){
        path = ["/", request.method, parse(request.url).pathname.toLowerCase()].join("")
        query = parse(request.url).search||""
        fullpath = [request.secure?"https://":"http://",request.headers.host, parse(request.url).pathname.toLowerCase(), query].join("")

        Route.call(this, path, { request: request, response: response })
        routes.set(this, Object.create(null))
        routes.get(this).query = objectify(query.slice(1))
        routes.get(this).fullpath = fullpath
    }
  , fullpath: { enumerable: true,
        get: function(){
            return routes.get(this).fullpath
        }
    }
  , query: { enumerable: true,
        get: function(){
            return routes.get(this).query
        }
    }
})

module.exports.HTTPCatchAllRoute = klass(module.exports.HTTPRequestRoute, {
    constructor: function(request, response, query, fullpath){
        query = parse(request.url).search||""
        fullpath = [request.secure?"https://":"http://",request.headers.host, parse(request.url).pathname.toLowerCase(), query].join("")

        Route.call(this, "catchall", { request: request, response: response })
        routes.set(this, Object.create(null))
        routes.get(this).query = objectify(query.slice(1))
        routes.get(this).fullpath = fullpath
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


            this.Route = module.exports.HTTPRequestRoute
        }
      , listen: { enumerable: true,
            value: function(){
                let server = servers.get(this).server = !servers.get(this).secure ? new http.Server
                                                      : new https.Server(this.options)


                servers.get(this).server.on("request", function(request, response, hit){
                    if ( hit = this.dispatchRoute(new this.Route(request, response)), !hit )
                      if ( hit = this.dispatchRoute(new this.CatchAllRoute(request, response)), !hit )
                        response.writeHead("404"), response.end()
                }.bind(this))

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
      , key: { enumerable: true,
            get: function(){ return "" } //TODO
          , set: function(v){}
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

module.exports.SServer = klass(module.exports.Server, function(statics){

    return {
        constructor: function(ssl){
            ssl = type(arguments[0]) == "object" && arguments[0].key && arguments[0].cert && arguments[0].ca ? arguments[0]
                : function(){ throw new Error("ssl options missing") }()

            module.exports.Server.apply(this, spread(arguments, 1))

            servers.get(this).secure = true
            servers.get(this).key = ssl.key
            servers.get(this).cert = ssl.cert
            servers.get(this).ca = ssl.ca

        }
      , options: { enumerable: true,
            get: function(opts){
                if ( !this.secure )
                  return null

                opts = { // TODO
                    requestCert: true
                  , rejectUnauthorized: false
                }

                try {
                    opts.key = this.ssl_key
                    opts.cert = this.ssl_cert
                    opts.ca = this.ssl_ca
                } catch(e){
                    throw e
                }

                return opts
            }
        }
      , secure: { enumerable: true,
            get: function(){ return !!servers.get(this).secure }
        }
      , ssl_key: { enumerable: true,
            get: function(){ return fs.readFileSync(servers.get(this).key) }
        }
      , ssl_cert: { enumerable: true,
            get: function(){ return fs.readFileSync(servers.get(this).cert) }
        }
      , ssl_ca: { enumerable: true,
            get: function(){ return fs.readFileSync(servers.get(this).ca) }
        }
    }
})
