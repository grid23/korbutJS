void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Event = require("./EventTarget").Event
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Serializer = require("./Serializer").Serializer

    module.exports.Collection = klass(EventTarget, function(statics){

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
          , find: { enumerable: true,
                value: function(){

                }
            }
          , subset: { enumerable: true,
                value: function(){

                }
            }
          , serialize: { enumerable: true,
                value: function(){

                }

            }

          , Serializer: { enumerable: true,
                get: function(){
                    return this._serializer || module.exports.Collection.Serializer
                }
            }
        }
    })

    module.exports.RemoveDataEvent = klass(Event, {
        constructor: function(model, key, pvalue){
            Event.call(this, "remove")

            Object.defineProperties(this, {
                model: { enumerable: true, get: function(){ return model } }
              , key: { enumerable: true, get: function(){ return key } }
              , from: { enumerable: true, get: function(){ return pvalue }}
              , to: { enumerable: true, get: function(){ return void 0 }}
            })
        }
    })

    module.exports.AddDataEvent = klass(Event, {
        constructor: function(model, key, nvalue, pvalue){
            Event.call(this, "add")

            Object.defineProperties(this, {
                model: { enumerable: true, get: function(){ return model } }
              , key: { enumerable: true, get: function(){ return key } }
              , from: { enumerable: true, get: function(){ return pvalue }}
              , to: { enumerable: true, get: function(){ return nvalue }}
            })
        }
    })

    module.exports.UpdateDataEvent = klass(Event, {
        constructor: function(model, keys){
            Event.call(this, "update")

            Object.defineProperties(this, {
                model: { enumerable: true, get: function(){ return model } }
              , keys: { enumerable: true, get: function(){ return [].concat(keys) } }
            })
        }
    })

    module.exports.Model = klass(EventTarget, function(statics, models){
        models = Object.create(null)

        function fromObject(){
        }

        function fromString(){
        }

        function update(model, key){
            if ( !models[model.uid] )
              return

            if ( models[model.uid].updating.keys.indexOf(key) == -1 ) {
              models[model.uid].updating.keys.push(key)
              clearTimeout(models[model.uid].updating.timer)
              models[model.uid].updating.timer = setTimeout(function(){
                  model.dispatchEvent(new module.exports.UpdateDataEvent(model, models[model.uid].updating.keys.splice(0, models[model.uid].updating.keys.length)))
              }, 4)
            }
        }

        Object.defineProperties(statics, {
            getModelByUid: { enumerable: true, value: function(uid){ return models[uid] ? models[uid].instance : null } }
        })

        return {
            constructor: function(items){
                Object.defineProperties(this, {
                    _data: { value: this.constructor.prototype._data ? Object.create(this.constructor.prototype._data) : {} }
                  , _hooks: { value: this.constructor.prototype._hooks ? Object.create(this.constructor.prototype._hooks) : {} }
                  , _uid: { value: UID.uid() }
                })

                if ( items = arguments.length == 1 && _.typeof(items) == "object" ? items : null, items )
                  this.setItem(items)

                models[this.uid] = { instance: this, updating: { keys: [], timer: null } }
            }
          , setItem: { enumerable: true,
                value: function(key, nvalue, pvalue, hook, added, updated, removed){
                    if ( arguments.length == 1 && _.typeof(arguments[0]) == "object" )
                      return function(iterator){
                          while ( iterator.next(), !iterator.current.done )
                            this.setItem(iterator.current.key, iterator.current.value)
                      }.call(this, new Iterator(arguments[0]))

                    key = _.typeof(key) == "string" ? key : Object.prototype.toString.call(key)
                    nvalue = function(value){
                        if ( typeof value == "function" )
                          while ( typeof value == "function" )
                            value = value.call(this)
                        return value
                    }.call(this, nvalue)

                    hook = this.hooks.hasOwnProperty(key) ? this.hooks[key] : null
                    pvalue = this.data.hasOwnProperty(key) ? this.data[key] : void 0

                    if ( typeof hook == "function" )
                      nvalue = hook.call(this, nvalue, pvalue)

                    if ( _.typeof(nvalue) == "object" )
                      return function(iterator){
                          while ( iterator.next(), !iterator.current.done )
                            this.setItem(iterator.current.key, iterator.current.value)
                      }.call(this, new Iterator(nvalue))

                    if ( _.typeof(nvalue) == "array" )
                      nvalue = [].concat(nvalue)

                    if ( nvalue == void 0 && this.data.hasOwnProperty(key) )
                      removed = true,
                      delete this.data[key]
                    else {
                      if ( !this.data.hasOwnProperty(key) )
                        added = true

                      this.data[key] = nvalue
                    }

                    if ( nvalue !== pvalue )
                      updated = true

                    if ( removed )
                      this.dispatchEvent(new module.exports.RemoveDataEvent(this, key, pvalue) )
                    if ( added )
                      this.dispatchEvent(new module.exports.AddDataEvent(this, key, nvalue, pvalue) )
                    if ( updated )
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
                      hits.push( this.data.hasOwnProperty(iterator.current.value) ? this.data[iterator.current.value] : void 0 )

                    return hits.length > 1 ? hits : hits[0]
                }
            }
          , removeItem: { enumerable: true,
                value: function(){

                }
            }

          , data: { enumerable: true,
                get: function(){
                    return this._data
                }
            }
          , hooks: { enumerable: true,
                get: function(){
                    return this._hooks
                }
            }

          , serialize: { enumerable: true,
                value: function(){

                }
            }

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    if ( !this._uid )
                      Object.defineProperty(this, "_uid", { value: UID.uid() })
                    return this._uid
                }
            }
          , defaults: { enumerable: true,
                get: function(){
                    return this._defaults
                }
            }
          , Serializer: { enumerable: true, configurable: true,
                get: function(){
                    return this._Serializer || Serializer
                }
            }
        }
    })

}()
