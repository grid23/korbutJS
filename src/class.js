void function(){ "use strict"
    var rnative = /\s*\[native code\]\s*/i

    module.exports.class = function(){
        var args = Array.prototype.slice.call(arguments)
          , statics = Object.create(null), k
          , Class
          , prototype = Object.create({})

        args[args.length-1] = function getDescriptors(descriptors, keys, i, l){
            if ( typeof descriptors == "function" )
              return getDescriptors( descriptors.call(null, statics) )

            descriptors.constructor = descriptors.constructor || function(){}
            Class = typeof descriptors.constructor == "function" && !descriptors.constructor.toString().match(rnative) ? descriptors.constructor
                  : typeof descriptors.constructor.value == "function" && !descriptors.constructor.value.toString().match(rnative) ? descriptors.constructor.value
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
}()
