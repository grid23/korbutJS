"use strict"

const path = require("path")
const ROOT_PATH = path.resolve(process.cwd(), path.dirname(require.main && require.main.filename ? require.main.filename : __filename) , "./")
const fs = require("fs")

const type = require("../utils").typeof
const klass = require("../class").class
const Event = require("../Event").Event
const EventTarget = require("../EventTarget").EventTarget

const events = new WeakMap
const watchers = new WeakMap

module.exports.ChangeEvent = klass(Event, {
    constructor: function(e, file, dir){
        Event.call(this, "change")
        events.set(this, Object.create(null))

        events.get(this).file = file
        events.get(this).dir = dir
        events.get(this).path = path.resolve(dir, file||"./")
    }
  , file: { enumerable: true,
      get: function(){ return events.get(this).file }
    }
  , directory: { enumerable: true,
      get: function(){ return events.get(this).dir }
    }
  , path: { enumerable: true,
      get: function(){ return events.get(this).path }
    }
  , purge: { enumerable: true, configurable: true,
        value: function(){
            events.delete(this)
        }
    }
})

module.exports.ErrorEvent = klass(Event, {
    constructor: function(err){
        Event.call(this, "error")
        events.set(this, Object.create(null))

        events.get(this).error = err
    }
  , error: { enumerable: true,
        get: function(){ return events.get(this).error }
    }
  , throw: { enumerable: true,
        value: function(){
            throw events.get(this).error
        }
    }
  , purge: { enumerable: true, configurable: true,
        value: function(){
            events.delete(this)
        }
    }
})

module.exports.Watcher = klass(EventTarget, function(statics){
    const DEF_REC = true
    const DEF_PER = true

    Object.defineProperties(statics, {
        ChangeEvent: { enumerable: true,
            get: function(){ return module.exports.ChangeEvent }
        }
      , ErrorEvent: { enumerable: true,
            get: function(){ return module.exports.ErrorEvent }
        }
    })

    function defaultHandleChange(e, file, dir){
        fs.stat(this.path, function(err, stats){
            if ( err ) throw err //TODO

            /*
            let ctime = +stats.ctime
            if ( watchers.get(this).ctime === ctime )
              return
            watchers.get(this).ctime = ctime
            */

            dir = !!watchers.get(this).isFile ? path.dirname(this.path) : this.path
            this.dispatchEvent( new this.ChangeEvent(e, file, dir) )
        }.bind(this))
    }

    function onstats(err, stats){
        err = err ? err
            : !stats.isDirectory() && !stats.isFile() ? new Error("invalid path")
            : null

        if ( err )
          return setTimeout(function(){
              this.dispatchEvent( new this.ErrorEvent(err) )
          }.bind(this))

        watchers.get(this).isFile = stats.isFile()

        fs.watch(this.path, { recursive: this.recursive, peristent: this.persistent }, this.handleChange.bind(this) )
    }

    return {
        constructor: function(dict){
            dict = type(dict) == "string" ? { path: dict }
                 : type(dict) == "object" ? dict
                 : {}
            watchers.set(this, Object.create(null))

            if ( dict.hasOwnProperty("root") ) this.root = dict.root
            if ( dict.hasOwnProperty("path") ) this.path = dict.path
            if ( dict.hasOwnProperty("recursive") ) this.recursive = dict.recursive
            if ( dict.hasOwnProperty("persistent") ) this.persistent = dict.persistent
            if ( dict.hasOwnProperty("handleChange") ) this.handleChange = dict.handleChange

            fs.stat(this.path, onstats.bind(this))
        }

      , ChangeEvent: { enumerable: true,
            get: function(){ return watchers.get(this).ChangeEvent || module.exports.ChangeEvent }
          , set: function(V){
                if ( module.exports.ChangeEvent.isImplementedBy(V) && type(V) == "function" )
                  watchers.get(this).ChangeEvent = V
            }
        }
      , ErrorEvent: { enumerable: true,
            get: function(){ return watchers.get(this).ErrorEvent || module.exports.ErrorEvent }
          , set: function(V){
                if ( module.exports.ErrorEvent.isImplementedBy(V) && type(V) == "function" )
                  watchers.get(this).ErrorEvent = V
            }
        }

      , root: { enumerable: true,
            get: function(){ return watchers.get(this).root || ROOT_PATH }
          , set: function(v){
                if ( type(v) == "string" )
                  watchers.get(this).root = path.resolve(ROOT_PATH, v)
            }
        }
      , path: { enumerable: true,
            get: function(){ return watchers.get(this).path || ROOT_PATH }
          , set: function(v){
                if ( type(v) == "string" )
                  watchers.get(this).path = path.resolve(ROOT_PATH, v)
            }
        }
      , recursive: { enumerable: true,
            get: function(){ return watchers.get(this).recursive || DEF_REC }
          , set: function(v){
                watchers.get(this).recursive = !!v
            }
        }
      , persistent: { enumerable: true,
            get: function(){ return watchers.get(this).persistent || DEF_PER }
          , set: function(v){
                watchers.get(this).persistent = !!v
            }
        }
      , handleChange: { enumerable: true,
            get: function(){ return watchers.get(this).handleChange || defaultHandleChange }
          , set: function(v){
                if ( type(v) == "function" )
                  watchers.get(this).handleChange == v
            }
        }
      , purge: { enumerable: true,
            value: function(){
                fs.unwatchFile(this.path, this.handleChange)
                EventTarget.prototype.purge.call(this)
                watchers.delete(this)
            }
        }
    }
})
