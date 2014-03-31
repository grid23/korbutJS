void function(){ "use strict"

    var utils = require("./utils")
      , klass = require("./class").class
      , Iterator = require("./Iterator").Iterator

    module.exports.Template = klass(function(statics){
        Object.defineProperties(statics, {
            fromDOMTree: { enumerable: true,
                value: function(){

                }
            }
        })

        return {
            constructor: function(expression, data){

            }
        }
    })

}()
