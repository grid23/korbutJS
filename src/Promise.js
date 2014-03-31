void function(){ "use strict"

    var _ = require("./utils")
      , klass = require("./class").class
      , Iterator = require("./Iterator").Iterator

    module.exports.Promise = klass(function(statics){
        Object.defineProperties(statics, {
            all: { enumerable: true,
                value: function(){
                    if ( !Iterator.iterable(promises) )
                      throw new TypeError("korbut.Promise.race requires an iterable object as argument 0.")

                    return new module.exports.Promise(function(resolve, reject, iterator, length, value){
                        iterator = new Iterator(promises)
                        length = promises.length()
                        value = []

                        function onresolve(idx){
                            return function(v){
                                value[idx] = v

                                if ( !(--length) )
                                  resolve(value)
                            }
                        }

                        function onreject(e){ reject(e) }

                        while ( !iterator.next().done )
                          void function(iteration, input){
                              input = iteration.value
                              if ( !module.exports.Promise.isImplementedBy(input) )
                                input = module.exports.Promise.cast(input)
                              input.then(onresolve(iteration.index), onreject)
                          }(iterator.current)
                    })
                }
            }
          , cast: { enumerable: true,
                value: function(v){
                    return new module.exports.Promise(function(resolve){ resolve(v) })
                }
            }
          , race: { enumerable: true,
                value: function(promises){
                    if ( !Iterator.iterable(promises) )
                      throw new TypeError("korbut.Promise.race requires an iterable object as argument 0.")

                    return new module.exports.Promise(function(resolve, reject, length, resolved){
                        iterator = new Iterator(promises)
                        length = iterator.length()

                        function onresolve(v){
                            if ( resolved )
                              return

                            resolved = true
                            resolve(v)
                        }

                        function onreject(){
                            if ( !(--length) )
                              reject(new Error("all promises were rejected"))
                        }

                        while ( !iterator.next().done )
                          if ( module.exports.Promise.isImplementedBy(iterator.current.value) )
                            iterator.current.value.then(onresolve, onreject)
                    })
                }
            }
          , reject: { enumerable: true,
                value: function(reason){
                    return new module.exports.Promise(function(resolve, reject){
                        reject(reason)
                    })
                }
            }
          , resolve: { enumerable: true,
                value: function(value){
                    return new module.exports.Promise(function(resolve){
                        resolve(value)
                    })
                }
            }
        })

        return {
            constructor: function(resolver, resolution){
                if ( typeof resolver !== "function" )
                  throw new TypeError("Constructor korbut.Promise requires a resolver function as argument 0.")

                resolution = { key: "pending", value: null }
                Object.defineProperty(this, "_state", { configurable: true,
                    get: function(){ return resolution }
                })

                resolver(resolve.bind(this), reject.bind(this))

                function resolve(v, handlers){
                    resolve = reject = function(){}

                    resolution.key = "resolved"
                    resolution.value = v
                    Object.freeze(resolution)

                    handlers = Array.isArray(this._onresolve) ? [].concat(this._onresolve) : []
                      while ( handlers.length )
                        handlers.shift().call(null, v)
                }

                function reject(r, handlers){
                    resolve = reject = function(){}

                    resolution.key = "rejected"
                    resolution.value = r
                    Object.freeze(resolution)

                    handlers = Array.isArray(this._onreject) ? [].concat(this._onreject) : []
                      while ( handlers.length )
                        handlers.shift().call(null, r)
                }
            }
          , then: { enumerable: true,
                value: function(onresolve, onreject){
                    return function(self, hasResolved, hasRejected){
                          if ( !hasResolved && !hasRejected ) {
                            return new module.exports.Promise(function(resolve, reject){
                                !Array.isArray(self._onresolve) && Object.defineProperty(self, "_onresolve", { value: [] })
                                !Array.isArray(self._onreject) && Object.defineProperty(self, "_onreject", { value: [] })

                                self._onresolve.push(function(v, rv){
                                    try {
                                        rv = onresolve(v)
                                    } catch(e) {
                                        reject(e)
                                        return
                                    }

                                    if ( rv && typeof rv.then == "function" )
                                      rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                    else resolve(rv)
                                })

                                self._onreject.push(function(r, rv){
                                    try {
                                        rv = onreject(r)
                                    } catch(e) {
                                        reject(e)
                                        return
                                    }

                                    if ( rv && typeof rv.then == "function" )
                                      rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                    else resolve(rv)
                                })
                            })
                          }

                          else if ( hasResolved )
                            return new module.exports.Promise(function(resolve, reject, rv){
                                try {
                                    rv = typeof onresolve == "function" ? onresolve(self._state.value) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })

                          else if ( hasRejected )
                            return new module.exports.Promise(function(resolve, reject, rv){
                                try {
                                    rv = typeof onreject == "function" ? onreject(self._state.value) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })
                    }(this, this._state.key == "resolved", this._state.key == "rejected" )
                }
            }
          , catch: { enumerable: true,
                value: function(onreject){
                    return function(self){
                        return new module.exports.Promise(function(resolve, reject){
                            self.then(resolve, function(r){
                                reject(r)
                                return onreject(r)
                            })
                        })
                    }( this )
                }
            }
          , state: { enumerable: true,
                get: function(){
                    return (this._state||{}).key
                }
            }
        }
    })

}()
