void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Event = require("./Event").Event
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Serializer = require("./Serializer").Serializer

    module.exports.Model = klass(EventTarget, function(statics){
        function fromObject(model, o, root, iterator){
            root = !!root ? root+".":""
            iterator = new Iterator(o)


            while ( !iterator.next().done )
              model.setItem(root+iterator.current.key, iterator.current.value)
        }

        function fromString(model, items, o){
            try {
                o = JSON.parse(items)
            } catch(e){
                try {
                    o = model.serializer.objectify(items)
                } catch(e){
                    o = {}
                }
            }

            return fromObject(model, o)
        }

        return {
            constructor: function(items){
                this.defaults && this.setItem(this.defaults)
                items && items.constructor === Object && this.setItem(items)
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
          , serialize: { enumerable: true,
                value: function(){

                }
            }

          , uid: { enumerable: true, configurable: true,
                get: function(){
                    if ( !this._uid )
                      this._uid = UID.uid()
                    return this._uid
                }
            }
          , defaults: { enumerable: true,
                get: function(){
                    return this._defaults
                }
            }
          , Serializer: { enumerable: true, configurable: true,
                get: function(){
                    return this._Serializer || Serializer
                }
            }
        }
    })

}()
