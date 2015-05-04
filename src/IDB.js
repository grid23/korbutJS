"use strict"

var _ = require("./utils")
var klass = require("./class").class

var Event = require("./EventTarget").Event
var EventTarget = require("./EventTarget").EventTarget
var Iterator = require("./Iterator").Iterator
var Service = require("./Service").Service
var UID = require("./UID").UID
var isSameDomain = require("./dom-utils/isSameDomain").isSameDomain

var TRUSTED_KEY = UID.uid()

module.exports.ConnectionSuccessEvent = klass(Event, function(){
    var events = Object.create(null)

    return {
        constructor: function(e){
            Event.call(this, "success")

            events[this.uid] = Object.create(null, {
                instance: { value: this }
              , db: { value: e.target.result }
            })

            console.log(Event.isImplementedBy(this))
        }
      /*, db: { enumerable: true,
            get: function(){ return events[this.uid].db }
        } are we willing to expose the db ? */
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete events[this.uid]
                Event.prototype.purge.apply(this, arguments)
            }
        }
    }
})

module.exports.IDBBroker = klass(function(statics){
    var brokers = Object.create(null)

    return {
        constructor: function(db, store, args){
            args = _.spread(arguments)
            store = module.exports.IDBStore.isImplementedBy(args[args.length-1]) ? args.pop()
                  : function(){ throw new TypeError("argument 1 must be a korbut.IDBStore instance") }()
            db = module.exports.IDB.isImplementedBy(args[args.length-1]) ? args.pop()
                  : function(){ throw new TypeError("argument 1 must be a korbut.IDB instance") }()


            brokers[this.uid] = Object.create(null, {
                db: { value: db }
              , store: { value: store }
            })
        }
        /*
      , cmd: { enumerable: true,
            value: function(data, cb, args){
                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                data = args.pop()

                return new Promise(function(resolve, reject, store){
                    brokers[this.uid].db.store(brokers[this.uid].store, function(db, request){
                        function onerror(err){
                            request.removeEventListener("error", onerror)
                            request.removeEventListener("success", onsuccess)

                            console.log("error", arguments)
                            reject(err)
                            if ( cb ) cb(err)
                        }

                        function onsuccess(){
                            request.removeEventListener("error", onerror)
                            request.removeEventListener("success", onsuccess)

                            console.log("success", arguments)
                            resolve()
                            if ( cb ) cb(null)
                        }

                        db = brokers[this.uid].db.getDB(TRUSTED_KEY)
                        store = db.transaction([brokers[this.uid].store.name], "readwrite").objectStore(brokers[this.uid].store.name)
                        request = store.xxx()

                        request.addEventListener("error", onerror)
                        request.addEventListener("success", onsuccess)
                    }.bind(this))
                }.bind(this))
            }
        }
        */

      , put: { enumerable: true,
            value: function(data, cb, args){
                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                data = args.pop()

                return new Promise(function(resolve, reject, store){
                    brokers[this.uid].db.store(brokers[this.uid].store, function(db, request){
                        function onerror(err){
                            console.log("e")
                            request.removeEventListener("error", onerror)
                            request.removeEventListener("success", onsuccess)

                            console.log("error", arguments)
                            reject(err)
                            if ( cb ) cb(err)
                        }

                        function onsuccess(){
                            request.removeEventListener("error", onerror)
                            request.removeEventListener("success", onsuccess)

                            console.log("success", arguments)
                            resolve()
                            if ( cb ) cb(null)
                        }

                        db = brokers[this.uid].db.getDB(TRUSTED_KEY)
                        store = db.transaction([brokers[this.uid].store.name], "readwrite").objectStore(brokers[this.uid].store.name)
                        request = store.put(data)

                        request.addEventListener("error", onerror)
                        request.addEventListener("success", onsuccess)
                    }.bind(this))
                }.bind(this))
            }
        }
      , get: { enumerable: true,
            value: function(key, cb, args){
                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                key = args.pop()

                return new Promise(function(resolve, reject, store){
                    brokers[this.uid].db.store(brokers[this.uid].store, function(db, request){
                        function onerror(err){
                            request.removeEventListener("error", onerror)
                            request.removeEventListener("success", onsuccess)

                            console.log("error", arguments)
                            reject(err)
                            if ( cb ) cb(err)
                        }

                        function onsuccess(e){
                            request.removeEventListener("error", onerror)
                            request.removeEventListener("success", onsuccess)

                            console.log("success", e.target.result, arguments)
                            resolve()
                            if ( cb ) cb(null)
                        }

                        db = brokers[this.uid].db.getDB(TRUSTED_KEY)
                        store = db.transaction([brokers[this.uid].store.name], "readwrite").objectStore(brokers[this.uid].store.name)
                        request = store.get(key)

                        request.addEventListener("error", onerror)
                        request.addEventListener("success", onsuccess)
                    }.bind(this))
                }.bind(this))
            }
        }
    }
})

module.exports.IDBStore = klass(function(statics){
    var stores = Object.create(null)

    return {
        constructor: function(name, dict, keyPath, autoIncrement, indexes, args){
            args = _.spread(arguments)
            dict = _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
            name = _.typeof(args[args.length-1]) == "string" ? args.pop() : ( console.warn("argument 0 (name) unprovided"), Object.prototype.toString.call( args.pop() ) )

            keyPath = _.typeof(dict.keyPath) == "string" ? dict.keyPath : null
            autoIncrement = !!dict.autoIncrement

            indexes = function(iterator, indexes){
                indexes = []

                while ( !iterator.next().done )
                  void function(iteration, index){
                      index = {}

                      index.name = isNaN(+iteration.key)  ? iteration.key
                             : _.typeof(iteration.value) == "string" ? iteration.value
                             : iteration.value && _.typeof(iteration.value.name) == "string" ? iteration.name
                             : null

                      index.keyPath = iteration.value && _.typeof(iteration.value.keyPath) == "string" ? iteration.value.keyPath
                                : keyPath

                      index.unique = !!iteration.value.unique


                      if ( index.name )
                        indexes.push(index)
                  }( iterator.current )

                return indexes
            }( new Iterator( ["object", "array"].indexOf(_.typeof( dict.indexes )) != -1 ? dict.indexes : [] ) )

            stores[this.uid] = Object.create(null, {
                name: { value: name }
              , keyPath: { value: keyPath }
              , indexes: { value: indexes }
            })
        }
      , name: { enumerable: true,
            get: function(){
                return stores[this.uid].name
            }
        }
      , keyPath: { enumerable: true,
            get: function(){
                return stores[this.uid].keyPath
            }
        }
      , indexes: { enumerable: true,
            get: function(){
                return [].concat(stores[this.uid].indexes)
            }
        }
      , autoIncrement: { enumerable: true,
            get: function(){
                return stores[this.uid].autoIncrement
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

module.exports.IDB = klass(EventTarget, function(statics){
    var dbs = Object.create(null)

    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
    var IDB_COMPAT = indexedDB && _.native(indexedDB.open) && _.native(IDBTransaction) && _.native(IDBKeyRange)
    var IDB_VERSION_COMPAT = _.native(window.IDBVersionChangeEvent)

    Object.defineProperties(statics, {
        COMPAT: { enumerable: true,
            get: function(){ return IDB_COMPAT }
        }
      , VERSION_COMPAT: { enumerable: true,
            get: function(){ return IDB_VERSION_COMPAT }
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return dbs.hasOwnProperty(uid) ? dbs[uid].instance : null
            }
        }
    })

    return {
        constructor: function(dict, name, scheme, args){
            args = _.spread(arguments)
            dict = _.typeof(args[args.length-1]) == "object" ? args.pop()
                 : _.typeof(args[args.length-1]) == "string" ? { name: args.pop() }
                 : {}
            name = _.typeof(dict.name) == "string" ? dict.name : (console.warn("name for IDB was not provided, falling back to object uid"), this.uid)

            dbs[this.uid] = Object.create(null, {
                instance: { value: this }
              , name: { value: name }
              , stores: { value: []}
              , version: { writable: true, value: _.typeof(dict.version) == "number" ? dict.version : null }
              , db: { writable: true, value: null }
            })
        }

        // idb.store("test", "ssn")
      , getDB: { enumerable: false,
            value: function(trusted_key){
                if ( trusted_key === TRUSTED_KEY )
                  return dbs[this.uid].db
            }
        }
      , store: { enumerable: true,
            value: function(store, cb, args){
                args = _.spread(arguments)
                cb = _.typeof( args[args.length-1] ) == "function" ? args.pop() : Function.prototype
                store = module.exports.IDBStore.isImplementedBy(args[args.length-1]) ? args.pop()
                      : new module.exports.IDBSTore(args.pop())

                return new Promise(function(resolve, reject){
                    function connect(request){
                        if ( !!dbs[this.uid].db )
                          dbs[this.uid].db.close(),
                          dbs[this.uid].db = null


                        request = indexedDB.open(dbs[this.uid].name, dbs[this.uid].version)

                        request.addEventListener("upgradeneeded", function onupgrade(e, db, stores){
                            request.removeEventListener("upgradeneeded", onupgrade, true)
                            console.log(e)
                            db = e.target.result
                            stores = _.spread(db.objectStoreNames)

                            if ( stores.indexOf(store.name) == -1 )
                                void function(st, iterator, indexNames){
                                    indexNames = _.spread(st.indexNames)

                                    while ( !iterator.next().done )
                                      void function(iteration){
                                          if ( indexNames.indexOf(iteration) == -1 )
                                            st.createIndex(iteration.name, iteration.keyPath, { unique: iteration.unique })
                                      }( iterator.current.value )
                                }( db.createObjectStore(store.name, { keyPath: store.keyPath, autoIncrement: store.autoIncrement }), new Iterator(store.indexes) )
                        }.bind(this), true)

                        request.addEventListener("error", function(e){
                            request.removeEventListener("error", onerror, true)
                            cb(e)
                            reject(e)
                        }.bind(this), true)

                        request.addEventListener("success", function onsuccess(e, transaction){
                            request.removeEventListener("success", onsuccess, true)

                            if ( dbs[this.uid].stores.indexOf(store) == -1 )
                              dbs[this.uid].stores.push(store)
                            dbs[this.uid].db = e.target.result

                            cb(null)
                            resolve(null)
                        }.bind(this), true)
                    }

                    if ( !this.connected || dbs[this.uid].stores.indexOf(store.name) == -1 )
                      connect.call(this)
                    else
                      resolve(null)
                }.bind(this))
            }
        }
      , connected: { enumerable: true,
            get: function(){ return !!dbs[this.uid].db }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete dbs[this.uid]
                EventTarget.prototype.purge.apply(this, arguments)
            }
        }
    }
})




/* ASSETS */
module.exports.IDBAsset = klass(EventTarget, function(statics){
    var assets = Object.create(null)

    function generateURL(url, a){
        a = document.createElement("a")
        a.href = url

        return a.href
    }

    Object.defineProperties(statics, {
        isLocalFile: { enumerable: true,
            value: isSameDomain
        }
    })

    return {
        constructor: function(dict, url, isLocal, args){
            args = _.spread(arguments)
            dict = _.typeof( args[args.length-1] ) === "object" ? args.pop() : { url: args.pop() }
            url = generateURL(dict.url)
            isLocal = module.exports.IDBAsset.isLocalFile(url)

            assets[this.uid] = Object.create(null, {
                instance: { value: this }
            })
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                assets dbs[this.uid]
                EventTarget.prototype.purge.apply(this, arguments)
            }
        }
    }
})
