void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Event = require("./EventTarget").Event
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Serializer = require("./Serializer").Serializer

    module.exports.CollectionAddModelEvent = klass(Event, {
        constructor: function(collection, model){
            Event.call(this, "add")

            this.collection = collection
            this.model = model
        }
      , collection: { enumerable: true, get: function(){ return this._collection }, set: function(v){ !this._collection && Object.defineProperty(this, "_collection", { value: v }) } }
      , model: { enumerable: true, get: function(){ return this._model }, set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) } }
    })

    module.exports.CollectionRemoveModelEvent = klass(Event, {
        constructor: function(collection, model){
            Event.call(this, "remove")

            this.collection = collection
            this.model = model
        }
      , collection: { enumerable: true, get: function(){ return this._collection }, set: function(v){ !this._collection && Object.defineProperty(this, "_collection", { value: v }) } }
      , model: { enumerable: true, get: function(){ return this._model }, set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) } }
    })

    module.exports.CollectionUpdateEvent = klass(Event, {
        constructor: function(collection){
            Event.call(this, "update")

            this.collection = collection
        }
      , collection: { enumerable: true, get: function(){ return this._collection }, set: function(v){ !this._collection && Object.defineProperty(this, "_collection", { value: v }) } }
    })

    module.exports.Collection = klass(EventTarget, function(statics, collections){
        collections = Object.create(null)

        function update(collection){
            if ( !collections[collection.uid] )
              return

            clearTimeout(collections[collection.uid].updating.timer)
            collections[collection.uid].updating.timer = setTimeout(function(){
                collection.dispatchEvent( new module.exports.CollectionUpdateEvent(collection) )
            }, 4)
        }

        Object.defineProperties(statics, {
            Serializer: { enumerable: true,
                value: klass(Serializer, {
                    _delimiter: ":"
                  , _separator: "|"
                })
            }
        })

        return {
            constructor: function(){
                if (arguments.length)
                  this.addModel.apply(this, arguments)

                collections[this.uid] = { instance: this, updating: { timer: null }}
            }
          , addModel: { enumerable: true,
                value: function(models, updated){
                    models = arguments.length == 1 && _.typeof(models) == "array" ? [].concat(models)
                         : _.spread(arguments)

                    while ( models.length )
                      void function(model){
                          if ( !module.exports.Model.isImplementedBy(model) )
                            model = new this.Model(model)

                          if ( this.models.indexOf(model) != -1 )
                            return

                          updated = true

                          this.models.push(model)
                          this.dispatchEvent( new module.exports.CollectionAddModelEvent(this, model) )
                      }.call(this, models.shift())

                    if ( updated )
                      update(this)
                }
            }
          , removeModel: { enumerable: true,
                value: function(models, updated){
                    models = arguments.length == 1 && _.typeof(models) == "array" ? [].concat(models)
                           : _.spread(arguments)

                    while ( models.length )
                      void function(model, idx){
                          while ( idx = this.models.indexOf(model), idx != -1 ) {
                            update = true

                            this.models.splice(idx, 1)
                            this.dispatchEvent( new CollectionRemoveModelEvent(this, model) )
                          }
                      }.call(this, models.shift())

                    if ( updated )
                      update(this)
                }
            }
          , sort: { enumerable: true,
                value: function(fn){
                    if ( _.typeof(fn) == "function" )
                      return this.models.sort(fn)
                }
            }
          , forEach: { enumerable: true,
                value: function(fn, i, l){
                    if ( _.typeof(fn) == "function" )
                      for ( i = 0, l = this.models.length; i < l; i++ )
                        fn(this.models[i])
                }
            }
          , find: { enumerable: true,
                value: function(args, hits, queries, list){
                    args = arguments.length > 1 ? _.spread(arguments)
                         : arguments.length == 1 && _.typeof(arguments[0]) == "array" ? [].concat(arguments[0])
                         : arguments.length == 1 ? [arguments[0]]
                         : []

                    hits = []
                    queries = []
                    list = [].concat(this.models)

                    if ( !args.length )
                      return hits

                    if ( args[0] == "*" )
                      return list

                    while ( args.length )
                      void function(query, k){
                          if ( _.typeof(query) == "string" )
                            query = Serializer.objectify(query)

                          if ( _.typeof(query) == "object" )
                            for ( k in query ) if ( query.hasOwnProperty(k) )
                              queries.push({ key: k, value: query[k] })

                      }.call(this, args.shift())

                    while ( list.length )
                      void function(model, hit, i, l){
                          for ( i = 0, l = queries.length; i < l; i++ ) {
                            if ( _.typeof(queries[i].value) == "function" ? queries[i].value(model.getItem(queries[i].key))
                               : queries[i].value === "*" ? true
                               : queries[i].value === model.getItem(queries[i].key)
                            ) hit++

                            if ( hit === l)
                              hits.push(model)
                          }
                      }.call(this, list.shift(), 0)

                    return hits
                }
            }
          , subset: { enumerable: true,
                value: function(){
                    return new this.constructor( this.find.apply(this, arguments) )
                }
            }
          , serialize: { enumerable: true,
                value: function(){

                }

            }

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    return this._uid ? this._uid : Object.defineProperty(this, "_uid", { value: UID.uid() })._uid
                }
            }
          , models: { enumerable: true,
                get: function(){
                    return this._models || Object.defineProperty(this, "_models", { value: [] })._models
                }
            }
          , Model: { enumerable: true,
                get: function(){
                    return this._Model || module.exports.Model
                }
              , set: function(v){
                    try {
                      if ( !this._Model && model.exports.Model.isImplementedBy(new v) )
                        Object.defineProperty(this, "_Model", { value: v })
                    } catch(e){}
                }
            }

          , Serializer: { enumerable: true,
                get: function(){ return this._Serializer || module.exports.Collection.Serializer }
              , set: function(v){ !this._Serializer && Object.defineProperty(this, "_Serializer", { value: v }) }
            }
        }
    })

    module.exports.RemoveDataEvent = klass(Event, {
        constructor: function(model, key, pvalue){
            Event.call(this, "remove")

            this.model = model
            this.key = key
            this.from = pvalue
            this.to = void 0
        }
      , model: { enumerable: true, get: function(){ return this._model }, set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) } }
      , key: { enumerable: true, get: function(){ return this._key }, set: function(v){ !this._key && Object.defineProperty(this, "_key", { value: v }) } }
      , from: { enumerable: true, get: function(){ return this._from }, set: function(v){ !this._from && Object.defineProperty(this, "_from", { value: v }) } }
      , to: { enumerable: true, get: function(){ return this._to }, set: function(v){ !this._to && Object.defineProperty(this, "to", { value: v }) } }
    })

    module.exports.AddDataEvent = klass(Event, {
        constructor: function(model, key, nvalue, pvalue){
            Event.call(this, "add")

            this.model = model
            this.key = key
            this.from = pvalue
            this.to = nvalue
        }
      , model: { enumerable: true, get: function(){ return this._model }, set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) } }
      , key: { enumerable: true, get: function(){ return this._key }, set: function(v){ !this._key && Object.defineProperty(this, "_key", { value: v }) } }
      , from: { enumerable: true, get: function(){ return this._from }, set: function(v){ !this._from && Object.defineProperty(this, "_from", { value: v }) } }
      , to: { enumerable: true, get: function(){ return this._to }, set: function(v){ !this._to && Object.defineProperty(this, "to", { value: v }) } }
    })

    module.exports.ChangeDataEvent = klass(Event, {
        constructor: function(model, key, nvalue, pvalue){
              Event.call(this, "change")

              this.model = model
              this.key = key
              this.from = pvalue
              this.to = nvalue
        }
      , model: { enumerable: true, get: function(){ return this._model }, set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) } }
      , key: { enumerable: true, get: function(){ return this._key }, set: function(v){ !this._key && Object.defineProperty(this, "_key", { value: v }) } }
      , from: { enumerable: true, get: function(){ return this._from }, set: function(v){ !this._from && Object.defineProperty(this, "_from", { value: v }) } }
      , to: { enumerable: true, get: function(){ return this._to }, set: function(v){ !this._to && Object.defineProperty(this, "to", { value: v }) } }
    })

    module.exports.UpdateDataEvent = klass(Event, {
        constructor: function(model, keys){
            Event.call(this, "update")

            this.model = model
            this.keys = [].concat(keys)
        }
      , model: { enumerable: true, get: function(){ return this._model }, set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) } }
      , key: { enumerable: true, get: function(){ return this._key }, set: function(v){ !this._key && Object.defineProperty(this, "_keys", { value: v }) } }
    })

    module.exports.Model = klass(EventTarget, function(statics, models){
        models = Object.create(null)

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
            Serializer: { enumerable: true, value: Serializer }
          , getModelByUid: { enumerable: true, value: function(uid){ return models[uid] ? models[uid].instance : null } }
        })

        return {
            constructor: function(){
                // generate uid first, because we need it when we set items (prevents "update" event from being fired at first pass)
                Object.defineProperty(this, "_uid", { value: UID.uid() })

                if ( arguments.length )
                  this.setItem.apply(this, arguments)

                models[this.uid] = { instance: this, updating: { keys: [], timer: null } }
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
                      hits.push( this.data.hasOwnProperty(iterator.current.value) ? this.data[iterator.current.value] : void 0 )

                    return hits.length > 1 ? hits : hits[0]
                }
            }
          , removeItem: { enumerable: true,
                value: function(key){
                    return this.setItem(key, void 0)
                }
            }

          , data: { enumerable: true,
                get: function(){
                    return this._data ? this._data : Object.defineProperty(this, "_data", { value: Object.create(this.constructor.prototype._data||{}) })._data
                }
            }
          , hooks: { enumerable: true,
                get: function(){
                  return this._hooks ? this._hooks : Object.defineProperty(this, "_hooks", { value: Object.create(this.constructor.prototype._hooks||{}) })._hooks
                }
            }

          , serialize: { enumerable: true,
                value: function(serializer){
                    return Serializer.isImplementedBy(serializer) ? serializer.serialize(this.data)
                         : this.serializer.serialize(this.data)
                }
            }

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    return this._uid ? this._uid : Object.defineProperty(this, "_uid", { value: UID.uid() })
                }
            }

          , serializer: { enumerable: true,
                get: function(){
                    return this._serializer ? this._serializer : Object.defineProperty(this, "_serializer", { value: module.exports.Model.Serializer })._serializer
                }
            }
          , Serializer: { enumerable: true, configurable: true,
                get: function(){
                    return this._serializer.constructor
                }
            }
        }
    })

}()
