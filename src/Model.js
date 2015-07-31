"use strict"

var _ = require("./utils")
var klass = require("./class").class
var EventTarget = require("./EventTarget").EventTarget
var Event = require("./Event").Event
var Iterator = require("./Iterator").Iterator
var Promise = require("./Promise").Promise
var UID = require("./UID").UID
var Serializer = require("./Serializer").Serializer

module.exports.RemoveDataEvent = klass(Event, {
    constructor: function(model, key, pvalue){
        Event.call(this, "remove")

        this.model = model
        this.key = key
        this.from = pvalue
        this.to = void 0
    }
  , model: { enumerable: true,
        get: function(){ return this._model }
      , set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) }
    }
  , key: { enumerable: true,
        get: function(){ return this._key }
      , set: function(v){ !this._key && Object.defineProperty(this, "_key", { value: v }) }
    }
  , from: { enumerable: true,
        get: function(){ return this._from }
      , set: function(v){ !this._from && Object.defineProperty(this, "_from", { value: v }) }
    }
  , to: { enumerable: true,
        get: function(){ return this._to }
      , set: function(v){ !this._to && Object.defineProperty(this, "to", { value: v }) }
    }
})

module.exports.AddDataEvent = klass(Event, {
    constructor: function(model, key, nvalue, pvalue){
        Event.call(this, "add")

        this.model = model
        this.key = key
        this.from = pvalue
        this.to = nvalue
    }
  , model: { enumerable: true,
        get: function(){ return this._model }
      , set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) }
    }
  , key: { enumerable: true,
        get: function(){ return this._key }
      , set: function(v){ !this._key && Object.defineProperty(this, "_key", { value: v }) }
    }
  , from: { enumerable: true,
        get: function(){ return this._from }
      , set: function(v){ !this._from && Object.defineProperty(this, "_from", { value: v }) }
    }
  , to: { enumerable: true,
        get: function(){ return this._to }
      , set: function(v){ !this._to && Object.defineProperty(this, "to", { value: v }) }
    }
})

module.exports.ChangeDataEvent = klass(Event, {
    constructor: function(model, key, nvalue, pvalue){
          Event.call(this, "change")

          this.model = model
          this.key = key
          this.from = pvalue
          this.to = nvalue
    }
  , model: { enumerable: true,
        get: function(){ return this._model }
      , set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) }
    }
  , key: { enumerable: true,
        get: function(){ return this._key }
      , set: function(v){ !this._key && Object.defineProperty(this, "_key", { value: v }) }
    }
  , from: { enumerable: true,
        get: function(){ return this._from }
      , set: function(v){ !this._from && Object.defineProperty(this, "_from", { value: v }) }
    }
  , to: { enumerable: true,
        get: function(){ return this._to }
      , set: function(v){ !this._to && Object.defineProperty(this, "to", { value: v }) }
    }
})

module.exports.UpdateDataEvent = klass(Event, {
    constructor: function(model, keys){
        Event.call(this, "update")

        this.model = model
        this.keys = [].concat(keys)
    }
  , model: { enumerable: true,
        get: function(){ return this._model }
      , set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) }
    }
  , key: { enumerable: true,
        get: function(){ return this._key }
      , set: function(v){ !this._key && Object.defineProperty(this, "_keys", { value: v }) }
    }
})

module.exports.Model = klass(EventTarget, function(statics){
    var models = Object.create(null)

    function update(model, key){
        if ( !models[model.uid] )
          return

        if ( models[model.uid].update.keys.indexOf(key) == -1 ) {
            models[model.uid].update.keys.push(key)
            clearTimeout(models[model.uid].update.timer)
            models[model.uid].update.timer = setTimeout(function(){
                model.dispatchEvent( new module.exports.UpdateDataEvent(model, models[model.uid].update.keys.splice(0)) )
            }, 4)
        }
    }

    function setRaw(obj, key, value, path){
        path = key.split(".")
        key = path.pop()

        while ( path.length )
          void function(key){
              obj = ( obj[key] = obj[key] || {} )
          }( path.shift() )

        obj[key] = value
    }

    Object.defineProperties(statics, {
        serializer: { enumerable: true,
            value: new Serializer
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return models[uid] ? models[uid].model : void 0
            }
        }
    })

    return {
        constructor: function(){
            models[this.uid] = Object.create(null, {
                model: { value: this }
              , data: { value: Object.create(null) }
              , export: { value: {} }
              , hooks: { value: Object.create(null) }
              , update: { value: { keys: [], timer: null } }
            })

            if ( this.constructor.prototype._hooks )
              this.setHook(this.constructor.prototype._hooks )

            if ( this.constructor.prototype._data )
              this.setItem(this.constructor.prototype._data )

            if ( arguments.length )
              this.setItem.apply(this, arguments)
        }
      , data: { enumerable: true,
            get: function(){
                return models[this.uid].data
            }
        }
      , raw: { enumerable: true,
            get: function(){
                return models[this.uid].export
            }
        }
      , hooks: { enumerable: true,
            get: function(){
                return models[this.uid] ? models[this.uid].hooks : function(){
                    this.data // access this.data to trigger the creation of models[this.uid]
                    return this.hooks
                }.call(this)
            }
        }
      , setItem: { enumerable: true,
            value: function(key, nvalue, pvalue, hook, added, updated, removed){
                if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                  return function(iterator){
                      while ( iterator.next(), !iterator.current.done )
                        this.setItem(iterator.current.key, iterator.current.value)
                  }.call(this, new Iterator(arguments[0]))

                if ( arguments.length == 1 && _.typeof(arguments[0]) == "string" )
                  return function(data){
                      return this.setItem(data)
                  }.call(this, this.serializer.objectify(arguments[0]))

                key = _.typeof(key) == "string" ? key : Object.prototype.toString.call(key)
                nvalue = function(value){
                    if ( typeof value == "function" )
                      while ( typeof value == "function" )
                        value = value.call(this)
                    return value
                }.call(this, nvalue)

                hook = this.hooks[key] || null
                pvalue = this.data[key] || void 0

                if ( typeof hook == "function" )
                  nvalue = hook.call(this, nvalue, pvalue)

                if ( _.typeof(nvalue) == "object" )
                  return function(iterator){
                      while ( iterator.next(), !iterator.current.done )
                        this.setItem(key + "." + iterator.current.key, iterator.current.value)
                  }.call(this, new Iterator(nvalue))

                if ( _.typeof(nvalue) == "array" )
                  return function(iterator, length){
                      while ( !iterator.next().done )
                        this.setItem(key + "." + iterator.current.key, iterator.current.value)
                      this.setItem(key+"."+"length", length)
                  }.call(this, new Iterator(nvalue), nvalue.length)

                if ( nvalue == void 0 && this.data[key] )
                  removed = true,
                  delete this.data[key]
                else {
                  if ( !this.data[key] )
                    added = true

                  setRaw(this.raw, key, nvalue)
                  this.data[key] = nvalue
                }

                if ( nvalue !== pvalue )
                  updated = true

                if ( removed )
                  this.dispatchEvent(new module.exports.RemoveDataEvent(this, key, pvalue))
                if ( added )
                  this.dispatchEvent(new module.exports.AddDataEvent(this, key, nvalue, pvalue))
                if ( updated )
                  this.dispatchEvent(new module.exports.ChangeDataEvent(this, key, nvalue, pvalue)),
                  update(this, key)
            }
        }
      , getItem: { enumerable: true,
            value: function(keys, hits, iterator){
                keys = arguments.length == 1 ? [keys]
                    : arguments.length > 1 ? _.spread(arguments)
                    : []
                hits = []
                iterator = new Iterator(keys)

                while( iterator.next(), !iterator.current.done )
                  hits.push( this.data[iterator.current.value] || void 0 )

                return hits.length > 1 ? hits : hits[0]
            }
        }
      , removeItem: { enumerable: true,
            value: function(key){
                return this.setItem(key, void 0)
            }
        }

      , setHook: { enumerable: true,
            value: function(key, handler){
                if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                  return function(iterator){
                      while ( iterator.next(), !iterator.done )
                        this.setHook(iterator.current.key, iterator.current.value)
                  }.call(this, new Iterator(arguments[0]))

                if ( _.typeof(key) == "string" && _.typeof(handler) == "function" )
                  this.hooks[key] = handler
            }
        }

      , serialize: { enumerable: true,
            value: function(serializer){
                return serializer && Serializer.isImplementedBy(serializer) ? serializer.serialize(this.data)
                     : this.serializer.serialize(this.data)
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , serializer: { enumerable: true,
            get: function(){
                return this._serializer ? this._serializer : Object.defineProperty(this, "_serializer", { value: module.exports.Model.serializer })._serializer
            }
        }
      , Serializer: { enumerable: true, configurable: true,
            get: function(){ return this._serializer.constructor }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                delete models[this.uid]
            }
        }
    }
})
