void function(){ "use strict"

    module.exports.native = function(rnative){
        return function(fn){
            try {
                return typeof fn == "function" ? !!fn.toString().match(rnative) : false
            } catch(e) {
                return null
            }
        }
    }( /\s*\[native code\]\s*/i )

    module.exports.spread = function(slice){
        return function(o, i){
            return slice.call(o, i)
        }
    }( Array.prototype.slice )

    module.exports.typeof = function(toString){
        return function(o, ntypeof){
            ntypeof = typeof o

            return ntypeof == "object" ? toString.call(o).slice(8, -1).toLowerCase() : ntypeof
        }
    }( Object.prototype.toString )

}()
