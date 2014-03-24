void function(){ "use strict"
    var _ = require("./utils")
      , klass = require("./class").class
      , EventTarget = require("./EventTarget").EventTarget
      , Event = require("./Event").Event

    module = klass(EventTarget, function(statics){

        return {
            constructor: function(){

            }
          , setItem: { enumeable: true,
                value: function(){

                }
            }
          , getItem: { enumerable: true,
                value: function(){

                }
            }
          , removeItem: { enumerable: true,
                value: function(){

                }
            }
          , items: { enumerable: true,
                value: function(items, cb){
                    items = _.spread(arguments)
                    cb = typeof items[items.length-1] == "function" ? items.pop() : null

                    void function(self, i, l){
                        for ( ; i < l; i++ )
                          items[i] = function(item){
                              if ( _.typeof(item) != "string" )
                                return void 0

                              return {
                                  set: function(v){
                                      return self.setItem(item, v)
                                  }
                                , get: function(){
                                      return self.getItem(item)
                                  }
                                , remove: function(){
                                      return self.removeItem(item)
                                  }

                                , on: function(e, h){
                                      return self.addEventListner(item+":"+"e", h)
                                  }
                                , off: function(e, h){
                                      return self.removeEventListner(item+":"+"e", h)
                                  }
                              }
                          }(items[i])
                    }( this, 0, items.length )

                    if ( cb )
                      cb.apply(null, items)
                }
            }
        }
    })

}()
