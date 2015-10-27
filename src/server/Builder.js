"use strict"

const path = require("path")
const ROOT_PATH = path.resolve(process.cwd(), path.dirname(require.main && require.main.filename ? require.main.filename : __filename , "./")

const type = require("../utils").typeof
const klass = require("../class").class
const Event = require("../Event").Event
const EventTarget = require("../EventTarget").EventTarget
const Watcher = require("./Watcher").Watcher

const events = new WeakMap
const builders = new WeakMap

module.exports.BuildEvent = klass(Event, {
    constructor: function(){
        Event.call(this, "build")
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

module.exports.Builder = klass(EventTarget, function(statics){

    Object.defineProperties(statics, {
        BuildEvent: { enumerable: true,
            get: function(){ return module.exports.BuildEvent }
        }
      , ErrorEvent: { enumerable: true,
            get: function(){ return module.exports.ErrorEvent }
        }
    })

    function defaultHandleCondition(){
        return true
    }

    return {
        constructor: function(dict){
            dict = type(dict) == "object" ? dict : {}
            builders.set(this, Object.create(null))

            if ( dict.hasOwnProperty("root") ) this.root = dict.root
            if ( dict.hasOwnProperty("to") ) this.to = dict.to
            if ( dict.hasOwnProperty("from") ) this.from = dict.from
            if ( dict.hasOwnProperty("handleCondition") ) this.handleCondition = dict.handleCondition
        }

      , BuildEvent: { enumerable: true,
            get: function(){ return builders.get(this).BuildEvent || module.exports.BuildEvent }
          , set: function(V){
                if ( module.exports.BuildEvent.isImplementedBy(V) && type(V) == "function" )
                  builders.get(this).BuildEvent = V
            }
        }
      , ErrorEvent: { enumerable: true,
            get: function(){ return builders.get(this).ErrorEvent || module.exports.ErrorEvent }
          , set: function(V){
                if ( module.exports.ErrorEvent.isImplementedBy(V) && type(V) == "function" )
                  builders.get(this).ErrorEvent = V
            }
        }

      , root: { enumerable: true,
            get: function(){ return builders.get(this).root || ROOT_PATH }
          , set: function(v){
                if ( type(v) == "string" )
                  builders.get(this).root = path.resolve(this.root, v)
            }
        }
      , to: { enumerable: true,
            get: function(){ return builders.get(this).to || this.root }
          , set: function(v){
                if ( type(v) == "string" )
                  builders.get(this).to = path.resolve(this.root, v)
            }
        }
      , from: { enumerable: true,
            get: function(){ return builders.get(this).from || this.root }
          , set: function(v){
                if ( type(v) == "string" )
                  builders.get(this).from = path.resolve(this.root, v)
            }
        }


      , build: { enumerable: true, configurable: true,
            value: function(file, directory){
                throw new Error("builder.build() must be implemented by the inheriting class")
            }
        }
      , handleCondition: { enumerable: true,
            get: function(){ return builders.get(this).handleCondition || defaultHandleCondition }
          , set: function(v){
                if ( type(v) == "function" )
                    builders.get(this).handleCondition = v
            }
        }
      , handleEvent: { enumerable: true,
            value: function(e, rv){

                if ( !Watcher.ChangeEvent.isImplementedBy(e) )
                  return

                try {
                  if ( this.handleCondition.call(this, e) )
                    rv = this.build.call( this, e.file, e.directory )

                  if ( rv && type(rv.then) == "function" )
                    rv.then(function(){
                        this.dispatchEvent( new this.BuildEvent )
                    }.bind(this), function(err){
                        this.dispatchEvent( new this.ErrorEvent(err) )
                    }.bind(this))
                  else
                    this.dispatchEvent(new this.BuildEvent)
                } catch(err){
                  this.dispatchEvent(new this.ErrorEvent(err))
                }
            }

        }

      , purge: { enumerable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                builders.delete(this)
            }
        }
    }

})
