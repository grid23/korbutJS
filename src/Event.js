void function(_, klass){
    "use strict"

    module.exports.Event = klass(function(statics){

        return {
            constructor: function(){
                module.exports.Event.prototype.initEvent.apply(this, arguments)
            }
          , initEvent: {
                value: function(){
                    var args = _.spread(arguments)
                      , data = args[args.length-1] && args[args.length-1].constructor === Object ? args.pop() : {}
                      , detail = this.detail !== void 0 && data.detail !== void 0 && data.detail !== null ? data.detail : null
                      , type = !this.type && _.typeof(args[0]) == "string" ? args.shift()
                             : !this.type ? "error"
                             : null

                    if ( !this.type )
                      Object.defineProperty(this, "_type", { value: type })

                    if ( this.detail !== void 0 )
                      Object.defineProperty(this, "_detail", { value: detail })

                    Object.defineProperty(this, "_timestamp", { value: +(new Date) })
                }
            }

          , type: { enumerable: true,
                get: function(){
                    return this._type
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
        }
    })

}( require("./utils"), require("./class").class )
