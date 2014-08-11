void function(){
    "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var EventTarget = require("./EventTarget").EventTarget
    var Iterator = require("./Iterator").Iterator
    var UID = require("./UID").UID
    var Model = require("./Model").Model

    module.exports.Template = module.exports.Template = klass({
        render: { enumerable: true, configurable: true,
            value: function(){ throw new Error("Template=>render(data) must be implemented by the inheriting class") }
        }
    })

    module.exports.View = klass(EventTarget, function(statics){
        var views = Object.create(null)
        var autoVars = ["A", "INPUT", "SUBMIT", "BUTTON"]

        Object.defineProperties(statics, {
            getByUid: { enumerable: true,
                value: function(uid){
                    return views[uid].view
                }
            }
        })

        function captureNodes(vars, root, ref, i, l){
            if ( !root || root.nodeType != Node.ELEMENT_NODE )
              return

            if ( ref = root.getAttribute("data-k-ref"), ref && ref.length )
              (vars[ref] = vars[ref] || []).push(root)

            if ( autoVars.indexOf(root.nodeName) != -1 )
              (vars[root.nodeName.toLowerCase()] = vars[root.nodeName.toLowerCase()] || []).push(root)


            if ( root.nodeType == Node.ELEMENT_NODE )
              for ( i = 0, l = root.childNodes.length; i < l; i++ )
                captureNodes(vars, root.childNodes[i])
        }

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
            constructor: function(args, handler, model, dict, template, buffer, events){
                views[this.uid] = Object.create(null)
                views[this.uid].view = this
                views[this.uid].Template = this.constructor.prototype._Template || module.exports.Template
                views[this.uid].Model = this.constructor.prototype._Model || Model
                views[this.uid].fragment = document.createDocumentFragment()
                views[this.uid].vars = {}

                args = _.spread(arguments)
                handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : null

                model = Model.isImplementedBy(args[args.length-1]) ? args.pop()
                     : args.length > 1 && "string, object".indexOf(_.typeof(args[args.length-1])) != -1 ? new this.Model(args.pop())
                     : new views[this.uid].Model

                dict = views[this.uid].Template.isImplementedBy(args[args.length-1]) ? { template: args.pop() }
                     : _.typeof(args[args.length-1]) == "object" && views[this.uid].Template.isImplementedBy(args[args.length-1].template) ? args.pop()
                     : { template: new views[this.uid].Template }

                if ( !views[this.uid].Template.isImplementedBy(dict.template) )
                  throw new TypeError("invalid template")

                views[this.uid].model = model
                views[this.uid].template = dict.template

                buffer = document.createElement("div")
                buffer.innerHTML = dict.template.render(model.flatten())
                while ( buffer.childNodes.length )
                  captureNodes(views[this.uid].vars, buffer.childNodes[0]),
                  (views[this.uid].vars.root = views[this.uid].vars.root || []).push(buffer.childNodes[0]),
                  views[this.uid].fragment.appendChild(buffer.childNodes[0])
                buffer = null

                _.typeof(this.constructor.prototype._DOMEvents) == "object" && addEventListeners(this, this._DOMEvents)
                _.typeof(dict.events) == "object" && addEventListeners(this, dict.events)
            }
          , Template: { enumerable: true,
                get: function(){ return views[this.uid].Template }
            }
          , template: { enumerable: true,
                get: function(){ return views[this.uid].template }
            }
          , model: { enumerable: true,
                get: function(){ return views[this.uid].model }
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
                value: function(){
                    if ( this.vars.hasOwnProperty(query) )
                      return this.vars[query][0]
                    return null
                }
            }
          , queryAll: { enumerable: true,
                value: function(){
                    if ( this.vars.hasOwnProperty(query) )
                      return [].concat(this.vars[query])
                    return []
                }
            }

            /*
          , clone: { enumerable: true,
                value: function(){
                    return new this.constructor({template: this.template}, this.model)
                }
            }
            */

          , uid: { enumerable: true, configurable: true,
                get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
            }
          , purge: { enumerable: true, configurable: true,
                value: function(what, nodes){
                    what = _.typeof(what) == "boolean" && what ? { nodes: true, model: true }
                         : _.typeof(what) == "object" ? what
                         : { nodes: false, model: false }

                    EventTarget.prototype.purge.call(this)

                    if ( what.nodes ) {
                      nodes = this.queryAll("root")
                      while ( nodes.length )
                        this.fragment.appendChild(nodes.shift())
                    }

                    if ( what.model )
                      this.model.purge()

                    delete views[this.uid]
                }
            }
        }
    })

}()
