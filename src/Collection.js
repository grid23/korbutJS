void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Event = require("./Event").Event
    var Model = require("./Model").Model
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Serializer = require("./Serializer").Serializer

    module.exports.Collection = klass(EventTarget, function(statics){
        Object.defineProperties(statics, {
            Serializer: { enumerable: true,
                value: new Serializer({delimiter: ":", separator: "|"})
            }
        })

        return {
            constructor: function(){

            }
          , addModel: { enumerable: true,
                value: function(){

                }
            }
          , removeModel: { enumerable: true,
                value: function(){

                }
            }
          , sort: { enumerable: true,
                value: function(){

                }

            }
          , each: { enumerable: true,
                value: function(){

                }
            }
          , find: { enumerable: true,
                value: function(){

                }
            }
          , subset: { enumerable: true,
                value: function(){

                }
            }

          , Model: { enumerable: true,
                get: function(){
                    return this._Model || Model
                }
            }
          , Serializer: { enumerable: true,
                get: function(){
                    return this._Serializer || statics.Serializer
                }
            }
        }
    })

}()
