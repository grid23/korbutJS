/* Copyright ©2014 Benjamin Moulin <hello@grid23.net>
   This work is free. You can redistribute it and/or modify it under the 
   terms of the Do What The Fuck You Want To Public License, Version 2, 
   as published by Sam Hocevar. See the COPYING file for more details. 
*/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"

var _ = require("./utils")

module.exports.class = function(args, Super, statics, Class, prototype){
    args = _.spread(arguments)
    Super = args.length == 2 ? args[0] : null
    statics = {}, k
    prototype = function(){
        if ( typeof args[args.length-1] == "function" )
          args[args.length-1] = _.invoke(args[args.length-1], { $Super: Super, $static: statics, 0: Super, 1: statics, length: 2 })

        if ( !_.native(args[args.length-1].constructor) ) {
          Class = args[args.length-1].constructor
          delete args[args.length-1].constructor
        }

        return _.invoke(mixin, args)
    }()

    Class = Class || function(){}
    Class.prototype = prototype
    Class.prototype.constructor = Class

    for ( k in statics ) if ( statics.hasOwnProperty(k) )
      Class[k] = statics[k]

    Class.Super = Super

    Class.create = function(args){
        args = arguments

        function F(){ return _.invoke(Class, args, this) }
        F.prototype = Class.prototype

        return new F
    }

    Class.extend = function(){
        return _.invoke(module.exports.class, [Class].concat(slice(arguments)))
    }

    Class.isImplementedBy = function(k, i, l, prototype){
        i = 0
        l = arguments.length

        for ( ; i < l; i++ ) {
            prototype = typeof arguments[i] == "function" ? arguments[i].prototype
                      : arguments[i] ? arguments[i] : {}

          for ( k in Class.prototype )
            if ( k != "constructor" && prototype[k] !== Class.prototype[k] )
              return false
        }

        return true
    }

    Class.implementsOn = function(k, i, l, prototype){
        i = 0
        l = arguments.length

        for ( ; i < l; i++ ) {
            prototype = typeof arguments[i] == "function" ? arguments[i].prototype
                      : arguments[i] ? arguments[i] : {}

            for ( k in Class.prototype ) if ( k !== "constructor" )
              prototype[k] = Class.prototype[k]
        }

    }

    return Class
}

module.exports.singleton = function(F, G){
    F = _.invoke(module.exports.class, arguments)
    G = module.exports.class(F, function(Super, statics, k){
        statics.instance = null

        for ( k in F ) if ( F.hasOwnProperty(k) )
          statics[k] = F[k]

        return {
            constructor: function(g){
                g = this

                if ( G.instance )
                  return  G.instance
                G.instance = g

                return _.invoke(Super, arguments, g)
            }
        }
    })

  return G

}

function mixin(args, k, i, l, prototype, superPrototype){
    args = _.spread(arguments)
    i = 0, l = args.length
    prototype = {}

    for ( ; i < l; i++ ) {
      superPrototype = typeof args[i] == "function" ? args[i].prototype
                     : args[i] ? args[i] : {}

        for ( k in superPrototype )
          if ( prototype[k] !== superPrototype[k] && superPrototype[k] !== Object.prototype[k] )
            prototype[k] = superPrototype[k]
    }

    delete prototype.constructor
    return prototype
}

},{"./utils":3}],2:[function(require,module,exports){
"use strict"

void function(korbutJS, define){

    korbutJS.utils = require("./utils")
    korbutJS.class = require("./class").class
    korbutJS.singleton = require("./class").singleton

    //korbutJS.Event = require("./Event")
    //korbutJS.EventTarget = require("./EventTarget")

    if ( typeof define == "function" && define.amd )
      define(function(require, module, exports){
          module.exports = korbutJS
      })
    else
      window.korbutJS = korbutJS
}( { version: "0.0.0-1395214046098" }, window.define )

},{"./class":1,"./utils":3}],3:[function(require,module,exports){
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

},{}]},{},[2])