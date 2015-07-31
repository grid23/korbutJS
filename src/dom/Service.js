"use strict"

var _ = require("../utils")
var klass = require("../class").class
var isSameDomain = require("./isSameDomain").isSameDomain

var EventTarget = require("../EventTarget").EventTarget
var Iterator = require("../Iterator").Iterator
var Model = require("../Model").Model
var Promise = require("../Promise").Promise
var Serializer = require("../Serializer").Serializer
var UID = require("../UID").UID


module.exports.Service = klass(function(statics){
    var services = Object.create(null)

    function defaultHandler(request){
        return [request.status, request]
    }

    Object.defineProperties(statics, {
        isLocalFile: { enumerable: true,
            value: isSameDomain
        }
      , getByUid: function(uid){
            return stylesheets[uid] ? stylesheets[uid].instance : void 0
        }
      , createCollectionFromService: { enumerable: true,
            value: function(){

            }
        }
      , createModelFromService: { enumerable: true,
            value: function(dict, cb, args, services, iterator){
                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : Function.prototype

                services = []

                iterator = new Iterator(args)
                while ( !iterator.next().done )
                  void function(service, index){
                      service = module.exports.Service.isImplementedBy(service) ? service
                              : new module.exports.Service(service)
                      index = services.length
                      services.push(service.request(function(err, status, request){
                          try {
                              services[index] = JSON.parse(request.responseText)
                          } catch(e){}
                      }))
                  }( iterator.current.value )

                return Promise.all(services).then(function(model, i, l){
                    model = new Model

                    for ( i = 0, l = services.length; i < l; i++ )
                      model.setItem(services[i])

                    cb(null, model)
                    return model
                }, function(e){
                    cb(e, null)
                    return e
                })
            }
        }
    })

    return {
        constructor: function(dict, handler, url, xdomain, credentials, headers, args, jsonp){
            args = _.spread(arguments)
            handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : defaultHandler
            dict = _.typeof(args[args.length-1]) == "object" ? args.pop()
                 : _.typeof(args[args.length-1]) == "string" ? { url: args.pop() }
                 : {}

            url = _.typeof(dict.url) == "string" ? dict.url : Object.prototype.toString(dict.url)
            xdomain = !!dict.crossDomain
            jsonp = !xdomain && !module.exports.Service.isLocalFile(url)
            credentials = dict.credentials && _.typeof(dict.credentials.user) == "string" && _.typeof(dict.credentials.password) == "string" ? dict.credentials : null

            services[this.uid] = Object.create(null, {
                instance: { value: this }
              , url: { value: url }

              , xdomain: { value: xdomain }
              , jsonp: { value: jsonp }
              , handler: { value: handler }

              , type: { value: dict.type && dict.type.toUpperCase() || "GET" }
              , async: { value: !dict.sync }
              , withCredentials: { value: !!credentials }
              , credientials : { value: credentials }
              , timeout: { value: dict.timeout || 0 }
              , requestHeaders: { value: _.typeof(dict.headers) == "object" ? dict.headers : null }
              , overrideMimeType: { value: dict.overrideMimeType }
              , responseType: { value: dict.responseType }

              , ongoing: { writable: true, configurable: true, value: null }
            })
        }
      , request: { enumerable: true,
            value: function(body, cb, url, args){
                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                body = Model.isImplementedBy(args[args.length-1]) ? args.pop().serialize()
                     : _.typeof(args[args.length-1]) == "object" ? Serializer.serialize(args.pop())
                     : args[args.length-1] ? args.pop()
                     : null

                if ( _.typeof(body) == "string" && services[this.uid].type == "GET" )
                  url =  [services[this.uid].url, "?", body].join(""),
                  body = null
                else
                  url = services[this.uid].url

                return new Promise(function(resolve, reject, request){
                    this.abort()
                    request = services[this.uid].ongoing = new XMLHttpRequest
                    request.open(services[this.uid].type, services[this.uid].url, services[this.uid].async, services[this.uid].withCredentials&&services[this.uid].credentials.user||void 0, services[this.uid].withCredentials&&services[this.uid].credentials.password||void 0)
                    request.timeout = services[this.uid].timeout

                    if ( services[this.uid].headers )
                      void function(iterator){
                          while ( !iterator.next().done )
                            request.setRequestHeader(iterator.current.key, iterator.current.value)
                      }.call(this, new Iterator(services[this.uid].headers))

                    if ( services[this.uid].overrideMimeType )
                      request.overrideMimeType(services[this.uid].overrideMimeType)

                    request.onreadystatechange = function(){
                        if ( request.readyState < 4 )
                          return

                        if ( services[this.uid].ongoing !== request )
                          reject(new Error("timeout"))
                        services[this.uid].ongoing = null

                        if ( request.status < 400 )
                          resolve(request)
                        else
                          reject(new Error(request.status))
                    }.bind(this)

                    request.onerror = function(e){
                        reject(e)
                    }.bind(this)

                    request.ontimeout = function(){
                        reject(new Error("xmlhttprequest timeout"))
                    }.bind(this)

                    request.send(body)
                }.bind(this)).then(function(req){
                    if ( cb )
                      cb.apply(null, [].concat(null, services[this.uid].handler.call(this, req)) )

                    return req
                }.bind(this), function(e){
                      cb.call(null, null)
                }.bind(this))
            }
        }
      , abort: { enumerable: true,
            value: function(){
                if ( services[this.uid].ongoing )
                  return services[this.uid].ongoing.abort()
            }
      }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                delete services[this.uid]
            }
        }
    }
})
