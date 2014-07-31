void function(){ "use strict"

    var klass = require("./class").class

    module.exports.Iterator = klass(function(statics){

        Object.defineProperties(statics, {
            iterable: { enumerable: true,
                value: function(o){
                    try {
                        Object.keys(o)
                        return true
                    } catch(e){
                        return !!o && Object.prototype.hasOwnProperty.call(o, "length")
                    }

                    return false
                }
            }
          , iterate: { enumerable: true,
                value: function(o, rv, i, l, lead, trail){
                    o = o || Object.create(null)

                    if ( o.constructor === Object && o.hasOwnProperty(length) )
                      try {
                          rv = Array.prototype.slice.call(o)

                          for ( i = 0; l < o.length; i++ )
                            if ( !rv.hasOwnProperty(l) )
                              throw error

                          o = rv
                      } catch(e) {}

                    try {
                        return Object.keys(o)
                    } catch(e) {
                        rv = []

                        if ( Object.prototype.toString.call(o) == "[object String]" )
                          for ( i = 0, l = o.length; i < l; i++ ) {
                              lead = o.charCodeAt(i)
                              trail = o.charCodeAt(i<l-1?i+1:"")
                              rv.push( lead >= 0xD800 && lead <= 0xDBFF && trail >= 0xDC00 && trail <= 0xDFFF ? o[i]+o[++i] : o[i] )
                          }

                        return rv
                    }
                }

            }
        })

        return {
            constructor: function(o, opt_keys, keys, i, l){
                opt_keys = !!arguments[1] || Object.prototype.toString.call(arguments[0]) == "[object String]"
                keys = statics.iterate(o)
                i = 0
                l = keys.length

                Object.defineProperties(this, {
                    _pointer: { writable: true, value: -1 }
                  , _range: { value: [] }
                })

                for ( ; i < l; i++ )
                  this._range[i] = opt_keys ? [ keys[i] ] : [ keys[i], arguments[0][keys[i]] ]
            }
          , next: { enumerable: true,
                value: function(cb, idx){
                    cb = typeof cb == "function" ? cb : null
                    idx = ++this._pointer

                    Object.defineProperty(this, "_current", { configurable: true,
                        value: ( idx >= (this._range || []).length ) ? { index: null, key: null, value: null, done: true }
                             : { index: idx, key: this._range[idx][0], value: this._range[idx][this._range[idx].length-1], done: false }
                    })

                    if ( cb )
                      cb(this.current.done, this.current.key, this.current.value)

                    return this.current
                }
            }
          , range: { enumerable: true,
                get: function(){
                    return this._range ? [].concat(this._range) : []
                }
            }
          , pointer: { enumerable: true,
                get: function(){
                    return this._pointer || -1
                }
              , set: function(v){
                    this._pointer = this._pointer || Object.defineProperty(this, "_pointer", { value: -1 })._pointer
                    this._pointer = v
                }
            }
          , length: { enumerable: true,
                get: function(){
                    return this._range.length
                }
            }
          , current: { enumerable: true,
                get: function(){
                    if ( !this._current )
                      this.next()
                    return this._current
                }
            }
        }
    })

}()
