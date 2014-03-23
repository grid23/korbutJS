void function(_){ "use strict"

    module.exports.class = function(args, statics, Class, prototype, k){
        args = _.spread(arguments)
        statics = Object.create(null)
        prototype = Object.create({})

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

        void function(properties){
            while ( properties.length )
              Object.defineProperty(Class, properties[0], Object.getOwnPropertyDescriptor(statics, properties.shift()))
        }( Object.getOwnPropertyNames(statics) )

        !Class.hasOwnProperty("create") && Object.defineProperty(Class, "create", {
            enumerable: true,
            value: function(args){
                args = _.spread(arguments)

                function F(){
                    return Class.apply(this, args)
                }
                F.prototype = Class.prototype

                return new F
            }
        })

        !Class.hasOwnProperty("extend") && Object.defineProperty(Class, "extend", {
            enumerable: true,
            value: function(){
                return module.exports.class.apply(null, [Class].concat(_.spread(arguments)))
            }
        })

        !Class.hasOwnProperty("isImplementedBy") && Object.defineProperty(Class, "isImplementedBy", {
            enumerable: true,
            value: function(o, prototype, k){
                prototype = _.typeof(o) == "function" ? o.prototype : Object.create(null)

                if ( !o )
                  return false

                if ( o instanceof Class )
                  return true

                for ( k in Class.prototype )
                  if ( k != "constructor" && function(o, c){
                      if ( o && c && o == c)
                        return false
                      return true
                  }( Object.getOwnPropertyDescriptor(prototype, k), Object.getOwnPropertyDescriptor(Class.prototype, k) ) ) return false
                return true
            }
        })

        !Class.hasOwnProperty("extend") && Object.defineProperty(Class, "implementsOn", {
            enumerable: true,
            value: function(o, prototype, properties){
                prototype = !_.typeof(o) == "function" ? o.prototype : {}
                properties = Object.getOwnPropertyNames(Class.prototype)

                while ( properties.length )
                  Object.defineProperty(prototype, properties[0], Object.getOwnPropertyDescriptor(Class.prototype, properties.shift()))

                Class.apply(this, _.spread(arguments, 1))
            }
        })

        return Class
    }

    module.exports.singleton = function(F, G){
        F = module.exports.class.apply(null, arguments)
        G = module.exports.class.call(null, F, function(statics, k){
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
