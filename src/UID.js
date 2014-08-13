"use strict"

var _ = require("./utils")
var klass = require("./class").class

module.exports.UID = klass(function(statics){
    var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    var MAP = "Fxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    var RADIX = 16
    var REGEXP = /[xy]/g
    var generators = Object.create(null)

    Object.defineProperties(statics, {
        uid: { enumerable: true,
            value: function(date){
                  date = Date.now()

                return MAP.replace(REGEXP, function(c, r){
                    r = (date + Math.random()*RADIX)%RADIX |0

                    if ( c === "y")
                      r = (r & 0x3)|0x8

                    return CHARS[r]
                })
            }
        }
    })

    return {
        constructor: function(dict){
            dict = dict && _.typeof(dict) == "object" ? dict : {}

            generators[this.uid] = {
                map: _.typeof(dict.map) == "string" ? dict.map : MAP
              , radix: _.typeof(dict.radix) == "number" ? dict.radix : RADIX
              , regexp: _.typeof(dict.regexp) == "regexp" ? dict.regexp : REGEXP
            }
        }
      , generate: { enumerable: true,
            value: function(date){
                  date = Date.now()

                return this.map.replace(this.regexp, function(c, r){
                    r = (date + Math.random()*this.radix)%this.radix |0

                    if ( c === "y")
                      r = (r & 0x3)|0x8

                    return CHARS[r]
                }.bind(this))
            }
        }
      , map: { enumerable: true,
            get: function(){
                return generators[this.uid].map
            }
        }
      , radix: { enumerable: true,
            get: function(){
                return generators[this.uid].radix
            }
        }
      , regexp: { enumerable: true,
            get: function(){
                return generators[this.uid].regexp
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){
                return this._uid || Object.defineProperty(this, "_uid", { value: module.exports.UID.uid() })._uid
            }
        }
    }
})
