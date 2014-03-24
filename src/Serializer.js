void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class

    module.exports.Serializer = klass(function(statics){

        Object.defineProperties(statics, {
            serialize: { enumerable: true,
                value: function(){

                }
            }
          , objectify: { enumerable: true,
                value: function(){

                }
            }
        })

        return {
            constructor: function(){}
          , serializer: { enumerable: true,
                value: function(){

                }
            }
          , objectify: { enumerable: true,
                value: function(){
                    
                }
            }
        }
    })

}()
