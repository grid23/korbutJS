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
