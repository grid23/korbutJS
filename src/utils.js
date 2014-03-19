"use strict"

var STRICT_MODE = function(){
        return this === void 0
    }()

module.exports.rcaptureargs = /(?=^|\s*)function(?:[^\(]*)\(([^\)]*)/
module.exports.rnative = /\s*\[native code\]\s*/i

module.exports.native = function(fn){
    try {
        return !!fn.toString().match(module.exports.rnative)
    } catch(e) {
        return null
    }
}

module.exports.typeof = function(toString){
    return function(o){
        return toString.call(o).slice(8, -1).toLowerCase()
    }
}( Object.prototype.toString )

module.exports.object = function(o){
    return !!o && o.constructor === Object
}

module.exports.invocable = function(o){
    return !!o && ( typeof o == "function" || typeof o.handleInvoke == "function" )
}

module.exports.eventable = function(o){
    return !!o && (module.exports.invocable(o) || module.exports.invocable(o.handleEvent))
}

module.exports.routable = function(o){
    return !!o && (module.exports.invocable(o) || module.exports.invocable(o.handleRoute))
}

module.exports.thenable = function(o){
    return !!o && (module.exports.invocable(o) || module.exports.invocable(o.handleResolve) || module.exports.invocable(o.handleReject))
}

module.exports.spread = function(slice){
    return function(o, idx, rv, i, l){
        try {
            return slice.call(o, +idx)
        } catch(e){ }

        rv = []
        o = !!o && o.length ? o : []

        for ( i = 0, l = o.length; i < l; i++ )
          rv.push(o[i])

        rv.splice(idx, Math.max(0, rv.length-idx))

        return rv
    }
}( Array.prototype.slice )

module.exports.enumerate = function(o, k, i, l, rv, lead, trail){
    try {
        return Object.keys(o)
    } catch(e) {}

    rv = []
    o = !!o ? (!!o.callee ? module.exports.spread(o) : o) : {}

    if ( module.exports.typeof(o) == "string" )
      for ( i = 0, l = o.length; i < l; i++ ) {
          lead = o.charCodeAt(i)
          trail = o.charCodeAt(i<l-1?i+1:"")

          if ( lead >= 0xD800 && lead <= 0xDBFF && trail >= 0xDC00 && trail <= 0xDFFF )
            rv.push(o.charAt(i)+o.charAt(++i))
          else
            rv.push(o.charAt(i))
      }
    else
      for ( k in o ) if ( rv.hasOwnProperty.call(o, k) )
        rv.push(k)

    return rv
}

module.exports.invoke = function(){
    return function(fn, args, ctx){
        fn = arguments[0] && typeof arguments[0].handleInvoke == "function" ? ( ctx = arguments[0], ctx.handleInvoke )
           : typeof arguments[0] == "function" ? arguments[0]
           : function(args){ throw new TypeError("") }(arguments) //TODO

        args = Array.isArray(arguments[1]) ? arguments[1]
             : arguments[1] && ( (!STRICT_MODE&&!!arguments[1].callee)||module.exports.typeof(arguments[1]) == "[object Arguments]" ) ? arguments[1]
             : module.exports.object(arguments[1]) ? buildMagicArguments(fn, arguments[1])
             : []

        ctx = ctx || arguments[2]

        switch ( args.length ){
            case 0: return fn.call(ctx)
            case 1: return fn.call(ctx, args[0])
            case 2: return fn.call(ctx, args[0], args[1])
            case 3: return fn.call(ctx, args[0], args[1], args[2])
        }

        return fn.apply(ctx, args)
    }

    function extractArguments(fn, args, i, l){
        args = function(){
            try {
                return fn.toString().match(module.exports.rcaptureargs)[1].split(",")
            } catch(e) {
                return []
            }
        }()
        i = 0
        l = args.length

        for ( ; i < l; i++ )
          args[i] = String.prototype.trim.call(args[i])

        return args
    }

    function buildMagicArguments(fn, args, waited, i, j, l, rv){
        waited = extractArguments(fn)
        i = 0
        j = 0
        rv = []

        for ( l = waited.length||0; i < l; i++ )
          if ( args.hasOwnProperty(waited[i]) )
            rv[i] = args[waited[i]]
          else
            rv[i] = args[j++]

        for ( l = args.length; j < l; j++)
          rv.push(args[j])

        return rv
    }
}()
