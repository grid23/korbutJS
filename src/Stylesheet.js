void function(){ "use strict"

    var utils = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator
    var EventTarget = require("./EventTarget").EventTarget
    var domReady = require("./domReady").domReady

    module.exports.CSSRule = klass(function(statics){

        return {
            constructor: function(dict, properties, cssRulesHandler){

            }
          , property: { enumerable: true,
                value: function(property, value, priority){

                }
            }
          , priority: { enumerable: true,
                value: function(property, priority){

                }
            }
        }
    })

    module.exports.Stylesheet = klass(EventTarget, function(statics){
        var BLOB_COMPAT = function(blob, url){
                try {
                    blob = new Blob([""], { type: "text/plain" })
                    url = URL.createObjectURL(blob)

                    if ( "msClose" in blob ) // on ie10 (+?), blobs are treated like x-domain files, making them unwritable
                        throw new Error
                } catch(e){
                    return 0
                }

                return 1
            }()

        return {
            constructor: function(args, dict, rules, resolver, resolution){
                args = _.spread(arguments)
                resolver = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                rules = Array.isArray(args[args.length-1]) ? args.pop() : null
                dict = _.typeof(args[args.length-1]) == "object" ? _.invoke(function(dict){

                       }, this, args.pop())
                     : _.typeof(args[args.length-1]) == "string" ? _.invoke(function(str, dict){

                       }, this, args.pop(), {})
                     : args[args.args.length-1] instanceof HTMLElement ? { node: args.pop() }
                     : {}

                resolution = { key: "loading", value: null }
                Object.defineProperty(this, "_state", { get: function(){ return resolution } })

                domReady.then(ondomready.bind(this))

                function ondomready(e){

                }
            }
          , rule: { enumerable: true,
                value: function(rule, callback){

                }
            }
          , media: { enumerable: true,
                value: function(mediaText){

                }
            }
          , disable: { enumerable: true,
                value: function(){

                }
            }
          , enable: { enumerable: true,
                value: function(){

                }
            }

          , state: { enumerable: true, configurable: true,
                get: function(){
                    return (this._state||{}).key
                }
            }
        }
    })

}()
