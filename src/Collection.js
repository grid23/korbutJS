"use strict"

var _ = require("./utils")
var klass = require("./class").class

var Event = require("./Event").Event
var EventTarget = require("./EventTarget").EventTarget

var Iterator = require("./Iterator").Iterator
var Model = require("./Model").Model
var Promise = require("./Promise").Promise
var Serializer = require("./Serializer").Serializer
var UID = require("./UID").UID

module.exports.CollectionAddModelEvent = klass(Event, {
    constructor: function(collection, model){
        Event.call(this, "add")

        this.collection = collection
        this.model = model
    }
  , collection: { enumerable: true,
        get: function(){ return this._collection }
      , set: function(v){ !this._collection && Object.defineProperty(this, "_collection", { value: v }) }
    }
  , model: { enumerable: true,
        get: function(){ return this._model }
      , set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) }
    }
})

module.exports.CollectionRemoveModelEvent = klass(Event, {
    constructor: function(collection, model){
        Event.call(this, "remove")

        this.collection = collection
        this.model = model
    }
  , collection: { enumerable: true,
        get: function(){ return this._collection }
      , set: function(v){ !this._collection && Object.defineProperty(this, "_collection", { value: v }) }
    }
  , model: { enumerable: true,
        get: function(){ return this._model }
      , set: function(v){ !this._model && Object.defineProperty(this, "_model", { value: v }) }
    }
})

module.exports.CollectionUpdateEvent = klass(Event, {
    constructor: function(collection){
        Event.call(this, "update")

        this.collection = collection
    }
  , collection: { enumerable: true, get: function(){ return this._collection }, set: function(v){ !this._collection && Object.defineProperty(this, "_collection", { value: v }) } }
})

module.exports.Collection = klass(EventTarget, function(statics){
    var collections = Object.create(null)
    var CSV_SEPARATOR = ";"

    function update(collection){
        if ( !collections[collection.uid] )
          return

        clearTimeout(collections[collection.uid].update.timer)
        collections[collection.uid].update.timer = setTimeout(function(){
            collection.dispatchEvent( new module.exports.CollectionUpdateEvent(collection) )
        }, 4)
    }

    Object.defineProperties(statics, {
        serializer: { enumerable: true,
            value: new ( klass(Serializer, { _delimiter: ":", _separator: "|"}) )
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return collections[uid] ? collections[uid].collection : void 0
            }
        }
      , CSVtoCollectionSync: { enumerable: true,
            value: function(csv, dict, separator, validationHandler, args, collection, props, i, l){
                args = _.spread(arguments)
                dict = _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
                csv = _.typeof(args[args.length-1]) == "string" ? args.pop().trim().replace(/\r/g, "").split(/\n|\r/)
                    : args[args.length-1] && _.typeof(args[args.length-1].toString) == "function" ? args[args.length-1].toString().trim().replace(/\r/g, "").split(/\n|\r/)
                    : []

                separator = _.typeof(dict.separator) == "string" ? dict.separator : CSV_SEPARATOR
                validationHandler = _.typeof(dict.validate) == "function" ? dict.validate : null

                collection = new module.exports.Collection
                props = csv.length ? csv.shift().split(separator) : []

                for ( i = 0, l = props.length; i < l; i++ )
                  props[i] = props[i].trim()

                try {
                    while ( csv.length )
                      void function(data, model){
                          if ( !data ) return

                          model = new Model

                          for ( i = 0; i < l; i++ )
                              model.setItem(props[i], data[i])

                          if ( validationHandler ) {
                            if ( validationHandler(model) )
                              collection.addModel(model)
                          } else
                            collection.addModel(model)
                      }( csv.length ? csv.shift().split(separator) : null )
                } catch(e){
                    return e
                }

                return collection
            }
        }
      , CSVtoCollection: { enumerable: true,
            value: function(csv, dict, callback, separator, validationHandler, args){
                args = _.spread(arguments)
                callback = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                dict = _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
                csv = _.typeof(args[args.length-1]) == "string" ? args.pop().trim().replace(/\r/g, "").split(/\n|\r/)
                    : args[args.length-1] && _.typeof(args[args.length-1].toString) == "function" ? args[args.length-1].toString().trim().replace(/\r/g, "").split(/\n|\r/)
                    : []

                separator = _.typeof(dict.separator) == "string" ? dict.separator : CSV_SEPARATOR
                validationHandler = _.typeof(dict.validate) == "function" ? dict.validate : null

                return new Promise(function(resolve, reject, collection, props, i, l){
                    function onresolve(d){
                        resolve(d)
                        if ( callback )
                          callback(null, d)
                    }

                    function onerror(e){
                        reject(e)
                        if ( callback )
                          callback(e, null)
                    }

                    collection = new module.exports.Collection
                    props = csv.length ? csv.shift().split(separator) : []

                    for ( i = 0, l = props.length; i < l; i++ )
                      props[i] = props[i].trim()

                    function partial(pcsv){
                          try {
                              pcsv = csv.splice(0, Math.min(100, csv.length))
                              //console.log(pcsv)
                              while ( pcsv.length )
                                void function(data, model){
                                    if ( !data ) return

                                    model = new Model

                                    for ( i = 0; i < l; i++ )
                                        model.setItem(props[i], data[i])

                                    if ( validationHandler ) {
                                      if ( validationHandler(model) )
                                        collection.addModel(model)
                                    } else
                                      collection.addModel(model)
                                }( pcsv.length ? pcsv.shift().split(separator) : null )
                          } catch(e) {
                              onreject(e)
                          }

                          if ( csv.length )
                            setTimeout(partial, 4)
                          else
                            onresolve(collection)
                    }
                    partial()
                })
            }
        }
    })

    return {
        constructor: function(){
            if (arguments.length)
              this.addModel.apply(this, arguments)
        }
      , models: { enumerable: true,
            get: function(){
                return collections[this.uid] ? collections[this.uid].models : function(){
                    collections[this.uid] = Object.create(null, {
                        collection: { value: this }
                      , models: { value: [] }
                      , update: { value: { timer: null } }
                    })
                    return this.models
                }.call(this)
            }
        }
      , length: { enumerable: true,
            get: function(){
                return this.models.length
            }
        }
      , addModel: { enumerable: true,
            value: function(models, updated){
                models = arguments.length == 1 && _.typeof(models) == "array" ? [].concat(models)
                     : _.spread(arguments)

                while ( models.length )
                  void function(model){
                      if ( !Model.isImplementedBy(model) )
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
                    fn(this.models[i], i, this.models)
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
            value: function(str){
                str = []

                this.forEach(function(model){
                  str.push(model.serialize())
                })

                return this.serializer.serialize(str)
            }

        }

      , uid: { enumerable: true, configurable: true,
            get: function(){
                return this._uid ? this._uid : Object.defineProperty(this, "_uid", { value: UID.uid() })._uid
            }
        }

      , Model: { enumerable: true,
            get: function(){
                return this._Model || Model
            }
          , set: function(v){
                try {
                  if ( !this._Model && model.exports.Model.isImplementedBy(new v) )
                    Object.defineProperty(this, "_Model", { value: v })
                } catch(e){}
            }
        }

      , serializer: { enumerable: true,
            get: function(){
                return this._serializer ? this._serializer : Object.defineProperty(this, "_serializer", { value: module.exports.Collection.serializer })._serializer
            }
        }
      , Serializer: { enumerable: true, configurable: true,
            get: function(){ return this._serializer.constructor }
        }
    }
})
