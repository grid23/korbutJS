void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Model = require("./Model").Model

    module.exports.WebStore = klass(Model, function(statics){

        return {
            constructor: function(){

            }
        }
    })

}()
