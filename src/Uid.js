void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class

    module.exports.Uuid = klass(function(statics, chars){
        chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("")

        Object.defineProperties(statics, {
            chars: { enumerable: true,
                get: function(chars){
                    return function(){ return chars }
                }( "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("") )
            }
        })

        return {
            constructor: function(){

            }
        }
    })

}()
