"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID
var Serializer = require("./Serializer").Serializer
var Iterator = require("./Iterator").Iterator
var Model = require("./Model").Model
var Event = require("./EventTarget").Event



var localStorage = window.localStorage


var LOCAL_STORAGE_COMPAT = localStorage && _.native(localStorage.setItem)

module.exports.StoreSyncEvent = klass(Event, {
    constructor: function(){
        Event.call(this, "webstoresync")
    }
})

module.exports.WebStore = klass(Model, function(statics){
    var stores = Object.create(null)

    Object.defineProperties(statics, {
        getByUid: { enumerable: true,
            value: function(uid){
                return stores[uid] && stores[uid].instance
            }
        }
      , IDB_COMPAT: { enumerable: true,
            get: function(){ return IDB_COMPAT }
        }
      , LOCAL_STORAGE_COMPAT: { enumerable: true,
            get: function(){ return LOCAL_STORAGE_COMPAT }
        }
    })

    return {
        constructor: function(){
            stores[this.uid] = Object.create(null, {
                instance: { value: this }
            })
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
                delete stores[this.uid]
            }
        }
    }
})
