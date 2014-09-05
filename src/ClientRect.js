"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID

var Point = klass(function(statics){
        var points = Object.create(null)

        return {
            constructor: function(){

            }
          , uid: { enumerable: true, configurable: true,
                get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
            }
          , purge: { enumerable: true, configurable: true,
                value: function(){
                    delete points[this.uid]
                }
            }
        }
    })

module.exports.Matrix = klass(function(statics){

    return {
        constructor: function(){

        }
      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete matrixes[this.uid]
            }
        }
    }
})

module.exports.ClientRect = klass(function(statics){

    return {
        constructor: function(){

        }
    }
})
