"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Iterator = require("./Iterator").Iterator
var UID = require("./UID").UID

module.exports.Serializer = klass(function(statics){
    var serializers = Object.create(null)
    var DELIMITER = "="
    var SEPARATOR = "&"
    var rspacetoplus = /%20/g
    var rplustospace = /\+/g

    Object.defineProperties(statics, {
        serialize: { enumerable: true,
            value: function(o, s, iterator, del, sep){
                s = []
                iterator = new Iterator(o)
                del = this.delimiter || DELIMITER
                sep = this.separator || SEPARATOR

                while( !iterator.next().done )
                  s.push( escape(iterator.current.key) + del + encodeURIComponent(iterator.current.value) )

                return s.join(sep).replace(rspacetoplus, "+")
            }
        }
      , objectify: { enumerable: true,
            value: function(s, o, iterator, del, sep){
                o = {}
                del = this.delimiter || DELIMITER
                sep = this.separator || SEPARATOR
                iterator = new Iterator(s.search(sep) != -1 ? s.split(sep) : s.length ? [s] : [])

                while ( !iterator.next().done )
                  void function(pair, idx, k, v){
                      idx = pair.indexOf(del)
                      k = pair.split(del, 1)
                      v = pair.slice(idx+1)

                      if ( idx != -1 )
                        o[k] = v
                      else
                        o[pair] = true
                  }( unescape(iterator.current.value.replace(rplustospace, "%20")) )

                return o
            }
        }
    })

    return {
        constructor: function(dict){
            dict = dict && _.typeof(dict) == "object" ? dict : {}

            serializers[this.uid] = Object.create(null, {
                instance: { value: this }
              , delimiter: { value: _.typeof(dict.delimiter) == "string" ? dict.delimiter : DELIMITER }
              , separator: { value: _.typeof(dict.separator) == "string" ? dict.separator : SEPARATOR }
            })
        }
      , serialize: { enumerable: true,
            value: function(o){
                return module.exports.Serializer.serialize.apply(this, [o])
            }
        }
      , objectify: { enumerable: true,
            value: function(s){
                return statics.objectify.call(this, s)
            }
        }
      , delimiter: { enumerable: true,
            get: function(){
                return serializers[this.uid].delimiter
            }
        }
      , separator: { enumerable: true,
            get: function(){
                return serializers[this.uid].separator
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete serializer[this.uid]
            }
        }
    }
})
