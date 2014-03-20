void function(_){ "use strict"

    module.exports.class = function(){
        var args = _.spread(arguments)
          , statics = Object.create(null), k
          , Class
          , prototype = Object.create({})

        args[args.length-1] = function getDescriptors(descriptors, keys, i, l){
            if ( _.typeof(descriptors) == "function" )
              return getDescriptors( descriptors.call(null, statics) )

            descriptors.constructor = descriptors.hasOwnProperty("constructor") ? descriptors.constructor : function(){}
            Class = _.typeof(descriptors.constructor) == "function" && !_.native(descriptors.constructor) ? descriptors.constructor
                  : _.typeof(descriptors.constructor.value) == "function" && !_.native(descriptors.constructor.value) ? descriptors.constructor.value
                  : function(){}
            delete descriptors.constructor

            try {
                return { prototype: Object.create(null, descriptors) }
            } catch(e) {
                keys = Object.keys(descriptors)
                while ( keys.length )
                  void function(key){
                      descriptors[key] = descriptors[key].constructor == Object
                                         && ( descriptors[key].hasOwnProperty("value")
                                              || descriptors[key].hasOwnProperty("get")
                                              || descriptors[key].hasOwnProperty("set") )
                                       ? descriptors[key]
                                       : { configurable: true, enumerable: true, writable: true,
                                           value: descriptors[key] }
                  }( keys.shift() )

                return { prototype: Object.create(null, descriptors) }
            }
        }( args[args.length-1] )

        while ( args.length )
          void function(Super, propertyNames){
              try {
                  propertyNames = Object.getOwnPropertyNames(Super.prototype)
              } catch(e){
                  propertyNames = []
              }

              while ( propertyNames.length )
                void function(property, descriptor){
                    Object.defineProperty(prototype, property, descriptor)
                }( propertyNames[0], Object.getOwnPropertyDescriptor(Super.prototype, propertyNames.shift()) )
          }( args.shift() )
        Object.defineProperty(prototype, "constructor", { configurable: true, value: Class })

        Class.prototype = prototype

        for ( k in statics )
          Class[k] = statics[k]

        Class.create = function(){
            var ars = _.spread(arguments)
            function F(){
                return Class.apply(this, args)
            }
            F.prototype = Class.prototype

            return new F
        }

        Class.extend = function(){
            return module.exports.class.apply(null, [Class].concat(_.spread(arguments)))
        }

        Class.isImplementedBy = function(){
            var prototype = _.typeof(arguments[0]) == "function" ? arguments[0].prototype : Object.create(null)
              , k

            if ( !o )
              return false

            if ( o instanceof Class )
              return true

            for ( k in Class.prototype )
              if ( k != "contstructor" && Object.getOwnPropertyDescriptor(prototype, k).value != Object.getOwnPropertyDescriptor(Class.prototype, k).value )
                return false
            return true
        }

        Class.implementsOn = function(){
            var prototype = !_.typeof(arguments[0]) == "function" ? arguments[0].prototype : {}
              , properties = Object.getOwnPropertyNames(Class.prototype)

            while ( properties.length )
              Object.defineProperty(prototype, properties[0], Object.getOwnPropertyDescriptor(Class.prototype, properties.shift()))
        }

        return Class
    }

    module.exports.singleton = function(){
        var F = module.exports.class.apply(null, arguments)
          , G = module.exports.class.call(null, F, function(statics, k){
                for ( k in F )
                  statics[k] = F[k]

                return {
                    constructor: function(){
                        if ( G.instance )
                          return G.instance
                        G.instance = this

                        return F.apply(this, arguments)
                    }
                }
            })
    }
}( require("./utils") )
