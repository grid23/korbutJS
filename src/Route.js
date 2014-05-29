void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.Route = klass(function(statics){

        return {
            constructor: function(path, detail){
                path = _.typeof(path) == "string" ? path : function(){ throw new Error("Route.path") }() //TODO
                detail = function(detail){
                    return !detail.length || (detail.length == 1 && "undefined, null".indexOf(_.typeof(detail[0])) != -1 ) ? null
                         : detail.length == 1 && _.typeof(detail[0]) == Object && detail[0].hasOwnProperty("detail") ? detail[0].detail
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

}()
