"use strict"

var _ = require("../utils")
var klass = require("../class").class
var EventTarget = require("../EventTarget").EventTarget
var Iterator = require("../Iterator").Iterator
var Model = require("../Model").Model
var ZParser = require("./ZParser").ZParser
var UID = require("../UID").UID

module.exports.ZView = klass(EventTarget, function(statics){
    var views = Object.create(null)

    Object.defineProperties(statics, {
        getByUid: function(uid){
            return views[uid] ? views[uid].view : void 0
        }
    })

    function addEventListeners(instance, dict, iterator){
        iterator = new Iterator(dict)

        while ( iterator.next(), !iterator.current.done )
          void function(nodes, iterator, i, l, handler){
              if ( l = nodes.length, !l )
                return

              while ( iterator.next(), !iterator.current.done )
                for ( i = 0; i < l; i++ )
                  nodes[i].addEventListener(iterator.current.key, function(fn){
                      return function(e){
                          fn.call(instance,e)
                      }
                  }(iterator.current.value))

          }(instance.queryAll(iterator.current.key), new Iterator(iterator.current.value))
    }

    return {
        constructor: function(args, handler, model, dict, expression, buffer, events){
            views[this.uid] = Object.create(null)
            views[this.uid].view = this
            views[this.uid].Model = this.constructor.prototype._Model || Model

            args = _.spread(arguments)
            handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : null

            dict = _.typeof(args[0]) == "string" ? { template: args.shift() }
                 : _.typeof(args[0]) == "object" && _.typeof(args[0].template) == "string" ? args.shift()
                 : { template: "" }

            model = Model.isImplementedBy(args[args.length-1]) ? args.pop()
                 : "string, object".indexOf(_.typeof(args[args.length-1])) != -1 ? new views[this.uid].Model(args.pop())
                 : new views[this.uid].Model

            views[this.uid].model = model
            views[this.uid].template = _.typeof(this.constructor.prototype._template) == "string" ? this.constructor.prototype._template : dict.template
            buffer = new ZParser(views[this.uid].template).parse(views[this.uid].model)
            views[this.uid].fragment = buffer.tree
            views[this.uid].vars = buffer.vars

            _.typeof(this._DOMEvents) == "object" && addEventListeners(this, this._DOMEvents)
            _.typeof(dict.events) == "object" && addEventListeners(this, dict.events)
        }
      , template: { enumerable: true,
            get: function(){ return views[this.uid].template }
        }
      , fragment: { enumerable: true,
            get: function(){ return views[this.uid].fragment }
        }
      , vars: { enumerable: true,
            get: function(){ return views[this.uid].vars }
        }
      , root: { enumerable: true,
            get: function(root){
                root = this.queryAll("root")

                return root.length > 1 ? root : root[0]
            }
        }
      , query: { enumerable: true,
            value: function(query){
                if ( this.vars.hasOwnProperty(query) )
                  return this.vars[query][0]
                return null
            }
        }
      , queryAll: { enumerable: true,
            value: function(query){
                if ( this.vars.hasOwnProperty(query) )
                  return [].concat(this.vars[query])
                return []
            }
        }

      , recover: { enumerable: true,
            value: function(nodes){
                nodes = this.queryAll("root")

                while ( nodes.length )
                  void function(node){
                      if ( node.parentNode !== this.fragment )
                        this.fragment.appendChild(nodes.shift())
                  }.call( this, nodes.shift() )
            }
        }
        /*
      , clone: { enumerable: true,
            value: function(){
                return new this.constructor({ template: this.template }, (this.constructor.call(this), this.model))
            }
        }
        */

      , model: { enumerable: true,
            get: function(){ return views[this.uid].model }
        }

      , toBuffer: { enumerable: true,
            value: function(dict, append, buffer, prepend){
                dict = _.typeof(dict) == "object" ? dict : {}

                append = _.typeof(dict.append) == "string" ? dict.append : ""
                buffer = function(nodes, str){
                    str = ""

                    while ( nodes.length )
                      str += nodes.shift().outerHTML

                    return str
                }.call( this, [].concat(this.queryAll("root")) )

                prepend = _.typeof(dict.prepend) == "string" ? dict.prepend : ""

                return new Buffer( append + buffer + prepend )
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(what){
                what = _.typeof(what) == "boolean" && what ? { nodes: true, model: true }
                     : _.typeof(what) == "object" ? what
                     : { nodes: false, model: false }

                EventTarget.prototype.purge.call(this)

                if ( what.nodes )
                  this.recover()

                if ( what.model )
                  this.model.purge()

                delete views[this.uid].view
            }
        }

      , Model: { enumerable: true,
            get: function(){ return views[this.uid].Model }
        }
    }

})
