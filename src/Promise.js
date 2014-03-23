void function(_, klass){ "use strict"

    module.exports.Promise = klass(function(statics, TRUST_KEY){
        Object.defineProperties(statics, {
            all: { enumerable: true,
                value: function(){}
            }
          , cast: { enumerable: true,
                value: function(){}
            }
          , race: { enumerable: true,
                value: function(){}
            }
          , reject: { enumerable: true,
                value: function(reason){
                    return new Promise(function(resolve, reject){
                        reject(reason)
                    })
                }
            }
          , resolve: { enumerable: true,
                value: function(value){
                    return new Promise(function(resolve){
                        resolve(value)
                    })
                }
            }
        })

        TRUST_KEY = +(new Date)

        return {
            constructor: function(resolver, internal){
                if ( typeof resolver !== "function" )
                  throw new Error //TODO

                resolver(resolve.bind(this), reject.bind(this))

                function resolve(v, handlers){
                    resolve = reject = function(){}

                    Object.defineProperties(this, {
                        "RESOLVED": { value: TRUST_KEY }
                      , "YIELD": { get: function(){ return v } }
                    })

                    handlers = Array.isArray(this._onresolve) ? [].concat(this._onresolve) : []
                      while ( handlers.length )
                        handlers.shift().call(null, v)
                }

                function reject(r, handlers){
                    resolve = reject = function(){}
                    Object.defineProperties(this, {
                        "REJECTED": { value: TRUST_KEY }
                      , "YIELD": { get: function(){ return r } }
                    })


                    handlers = Array.isArray(this._onreject) ? [].concat(this._onreject) : []
                      while ( handlers.length )
                        handlers.shift().call(null, r)
                }
            }
          , then: { enumerable: true,
                value: function(onresolve, onreject){
                    return function(self, hasResolved, hasRejected){
                          if ( !hasResolved && !hasRejected ) {
                            return new Promise(function(resolve, reject){
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
                            return new Promise(function(resolve, reject, rv){
                                try {
                                    rv = typeof onresolve == "function" ? onresolve(self.YIELD) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })

                          else if ( hasRejected )
                            return new Promise(function(resolve, reject, rv){
                                try {
                                    rv = typeof onreject == "function" ? onreject(self.YIELD) : null
                                } catch(e) {
                                    reject(e)
                                    return
                                }

                                if ( rv && typeof rv.then == "function" )
                                  rv.then(function(v){ resolve(v) }, function(r){ reject(r) })
                                else resolve(rv)
                            })
                    }(this, this.RESOLVED == TRUST_KEY, this.REJECTED == TRUST_KEY)
                }
            }
          , catch: { enumerable: true,
                value: function(onreject){
                    return function(self){
                        return new Promise(function(resolve, reject){
                            self.then(resolve, function(r){
                                reject(r)
                                return onreject(r)
                            })
                        })
                    }( this )
                }
            }
        }
    })

}( require("./utils"), require("./class").class )
