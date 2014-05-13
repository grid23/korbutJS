void function(){ "use strict"

    var utils = require("./utils")
    var klass = require("./class").class
    var Template = require("./Template").Template

    module.exports.View = klass(function(statics){
        Object.defineProperties(statics, {

        })

        return {
            constructor: function(){

            }
          , render: { enumerable: true,
                value: function(){

                }
            }

          , model: { enumerable: true,
                get: function(){
                    return this._model
                }
            }
          , template: { enumerable: true,
                get: function(){
                    return this._template
                }
            }

          , Model: {
                enumerable: true,
                get: function(){
                    return this._Model || Model
                }
            }
          , Template: { enumerable: true,
                get: function(){
                    return this._Template || Template
                }
            }
        }

    })

}()
