void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class

    module.exports.UID = klass(function(statics){
        var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        var MAP = "Kxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        var RADIX = 16
        var REGEXP = /[xy]/g

        Object.defineProperties(statics, {
            uid: { enumerable: true,
                value: function(map, radix, date, regexp){
                      map = _.typeof(this.map) == "string" ? this.map : MAP
                      radix = _.typeof(this.radix) == "number" ? this.radix : RADIX
                      regexp = _.typeof(this.regexp) == "regexp" ? this.regexp : REGEXP
                      date = Date.now()


                    return map.replace(regexp, function(c, r){
                        r = (date + Math.random()*radix)%radix |0

                        if ( c === "y")
                          r = (r & 0x3)|0x8

                        return CHARS[r]
                    })
                }
            }
        })

        return {
            constructor: function(dict){
                dict = dict && _.typeof(dict) == Object ? dict : {}

                _.typeof(dict.map) == "string" && Object.defineProperty(this, "_map", { value: dict.map })
                _.typeof(dict.radix) == "number" && Object.defineProperty(this, "_map", { value: dict.number })
            }
          , generate: { enumerable: true,
                value: function(){
                    return statics.uid.call(this)
                }
            }
          , map: { enumerable: true,
                get: function(){
                    return this._map || MAP
                }
            }
          , radix: { enumerable: true,
                get: function(){
                    return this._radix || RADIX
                }
            }
        }
    })

}()
