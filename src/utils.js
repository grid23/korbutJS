"use strict"

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
    return function(o, i, l){
        return slice.call(o, i, l)
    }
}( Array.prototype.slice )

module.exports.typeof = function(toString){
    return function(o, ntypeof){
        if ( Array.isArray(o) )
          return "array"

        ntypeof = typeof o

        return ntypeof == "object" ? toString.call(o).slice(8, -1).toLowerCase() : ntypeof
    }
}( Object.prototype.toString )

module.exports.invoke = function(fn, ctx, args){
    fn = typeof fn == "function" ? fn : function(){ throw new TypeError("korbut.utils.invoke - function expected as argument 0") }()
    ctx = arguments[1] || null
    args = arguments.length == 3 && Array.isArray(args) ? args
         : module.exports.spread(arguments, 2)

    switch ( args.length ) {
        case 0:
          return Function.prototype.call.call(fn, ctx)
        case 1:
          return Function.prototype.call.call(fn, ctx, args[0])
        case 2:
          return Function.prototype.call.call(fn, ctx, args[0], args[1])
        case 3:
          return Function.prototype.call.call(fn, ctx, args[0], args[1], args[2])
        default:
          return Function.prototype.apply.call(fn, ctx, args)
    }
}
