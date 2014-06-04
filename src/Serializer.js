void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator

    module.exports.Serializer = klass(function(statics){
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
                dict = dict && _.typeof(dict) == Object ? dict : {}

                _.typeof(dict.delimiter) == "string" && Object.defineProperty(this, "_delimiter", { value: dict.delimiter })
                _.typeof(dict.separator) == "string" && Object.defineProperty(this, "_separator", { value: dict.separator })
            }
          , serialize: { enumerable: true,
                value: function(o){
                    return statics.serialize.call(this, o)
                }
            }
          , objectify: { enumerable: true,
                value: function(s){
                    return statics.objectify.call(this, s)
                }
            }
          , delimiter: { enumerable: true,
                get: function(){
                    return this._delimiter || DELIMITER
                }
            }
          , separator: { enumerable: true,
                get: function(){
                    return this._separator || SEPARATOR
                }
            }
        }
    })

}()
