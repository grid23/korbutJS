"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Model = require("./Model").Model
var UID = require("./UID").UID
var Serializer = require("./Serializer").Serializer
var Iterator = require("./Iterator").Iterator
var Event = require("./EventTarget").Event

module.exports.StoreSyncEvent = klass(Event, {
    constructor: function(){
        Event.call(this, "webstoresync")
    }
})

module.exports.WebStore = klass(Model, function(statics){
    var stores = Object.create(null)

    Object.defineProperties(statics, {
        getByUid: function(uid){
            return stores[uid] && stores[uid].instance
        }
    })

    return {
        constructor: function(){

        }
      , sync: { enumerable: true,
            value: function(){

            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(){
                Model.prototype.purge.call(this)
                delete stores[this.uid]
            }
        }
    }
})
