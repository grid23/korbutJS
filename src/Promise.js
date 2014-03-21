void function(_, klass, EventTarget){ "use strict"

    module.exports.Promise = klass(function(statics){
        Object.defineProperties(statics, {
            PENDING: { enumerable: true, value: 1 }
          , REJECTED: { enumerable: true, value: 2 }
          , RESOLVED: { enumerable: true, value: 4 }

          , all: { enumerable: true,
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

        return {
            constructor: function(resolver){
                if ( typeof resolver !== "function" )
                  throw new Error //TODO

                Object.defineProperty(this, "_promiseState", { configurable: true, value: statics.PENDING })

                void function(self){
                    function onresolve(e){
                        self.removeEventListener("resolve", onresolve)
                        self.removeEventListener("reject", onreject)
                    }
                    function onreject(e){
                        self.removeEventListener("resolve", onresolve)
                        self.removeEventListener("reject", onreject)
                    }

                    function resolve(v){
                        self.dispatchEvent("resolve", v)
                    }

                    function reject(r){
                        self.dispatchEvent("reject", r)
                    }

                    self.addEventListener("resolve", onresolve)
                    self.addEventListener("reject", onreject)

                    resolver.call(null, resolve, reject)
                }( this )
            }
          , then: { enumerable: true,
                value: function(onresolve, onreject){
                    return function(self, onresolve, onreject){
                        return new Promise(function(resolve, reject){

                        }
                    }( this, typeof onresolve == "function" ? onresolve : null, typeof onreject == "function" ? onreject : null )
                }
            }
          , catch: { enumerable: true,
                value: function(onreject){
                    typeof onreject == "function" && Object.define(this, "_defaultRejectHandler", { configurable: true, value: onreject })
                }
            }

          , state: { enumerable: true,
                get: function(){
                    return this._promiseState || statics.PENDING
                }
            }
          , PENDING: { enumerable: true,
                get: function(){
                    return statics.PENDING
                }
            }
          , REJECTED: { enumerable: true,
                get: function(){
                    return statics.REJECTED
                }
            }
          , RESOLVED: { enumerable: true,
                get: function(){
                    return statics.RESOLVED
                }
            }
        }
    })

}( require("./utils"), require("./class").class, require("./EventTarget").EventTarget )
