"use strict"

var _ = require("./utils")
var klass = require("./class").class

var Event = require("./EventTarget").Event
var EventTarget = require("./EventTarget").EventTarget
var UID = require("./UID").UID

module.exports.IDB = klass(EventTarget, function(statics){
    var dbs = Object.create(null)

    var localStorage = window.localStorage
    var sessionStorage = window.sessionStorage
    var LOCAL_STORAGE_COMPAT = localStorage && _.native(localStorage.setItem) && sessionStorage && _.native(sessionStorage.setItem)

    Object.defineProperties(statics, {
        COMPAT: { enumerable: true,
            get: function(){ return LOCAL_STORAGE_COMPAT }
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return dbs.hasOwnProperty(uid) ? dbs[uid].instance : null
            }
        }
    })

    return {
        constructor: function(){
            dbs[this.uid] = Object.create(null, {
                instance: { value: this }
            })
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete dbs[this.uid]
            }
        }
    }
})
