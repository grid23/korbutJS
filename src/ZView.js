"use strict"

var _ = require("./utils")
var klass = require("./class").class
var EventTarget = require("./EventTarget").EventTarget
var Iterator = require("./Iterator").Iterator
var Model = require("./Model").Model
var UID = require("./UID").UID
var requestAnimationFrame = require("./dom-utils/requestAnimationFrame").requestAnimationFrame

var DOCUMENT, WINDOW, ELEMENT, NODE

module.exports.getDocument = function(v){
    return DOCUMENT
}

module.exports.setDocument = function(v){
    DOCUMENT = v
    WINDOW = DOCUMENT.defaultView
    ELEMENT = WINDOW.Element
    NODE = WINDOW.Node
    require("./dom-utils/requestAnimationFrame").setWindow(WINDOW)
}

if ( typeof window !== "undefined" )
    module.exports.setDocument(window.document)
else
    module.exports.setDocument(require("jsdom").jsdom())

module.exports.ZenParser = klass(function(statics){
    var CLASS_LIST_COMPAT = ELEMENT.prototype.hasOwnProperty("classList")

    var rtemplatevars = /\$([^$\s]*)/g
    var templateVarGlyph = "\\$"

    var traversals = Object.create(null, {
            "+": { enumerable: true,
                value: function sibling(stream, input, output){
                    input.context.parentNode.appendChild(input.buffer)
                }
            }
          , ">": { enumerable: true,
                value: function child(stream, input, output){
                    input.context.appendChild(input.buffer)
                }
            }
          , "^": { enumerable: true,
                value: function climb(stream, input, output){
                    input.context = input.context.parentNode || input.context
                    traversals["+"](stream, input, output)
                }
            }
        })

    var operators = Object.create(null, {
            "#": { enumerable: true,
                value: function(stream, input, output, node, rawid, model, vars, hit, onupdate){
                    node = input.buffer
                    rawid = input.pile
                    model = input.data
                    vars = []

                    while ( hit = (rtemplatevars.exec(rawid)||[])[1], hit )
                      if ( vars.indexOf(hit) == -1 )
                        vars.push(hit)

                    if ( vars.length ) {
                        onupdate = function(e, str, hit, i, l, value){
                            str = rawid

                            for ( i = 0, l = e.keys.length; i < l; i++ )
                              if ( vars.indexOf(e.keys[i]) != -1 ) {
                                  hit = true
                                  break
                              }

                            if ( hit ) {
                              for ( i = 0, l = vars.length; i < l; i++ ) {
                                value = model.getItem(vars[i])

                                if ( value !== void 0 && value !== null )
                                  str = str.replace(new RegExp(templateVarGlyph+vars[i], "g"), function(){ return value })
                              }

                              requestAnimationFrame(function(){
                                  node.setAttribute("id", module.exports.ZenParser.escapeHTML(str))
                              })
                            }
                        }

                        input.update.push(onupdate)
                        onupdate({keys: vars})
                    } else
                        node.setAttribute("id", module.exports.ZenParser.escapeHTML(rawid))
                }
            }
          , ".": { enumerable: true,
                value: function(){
                    function set(node, newClass, replacedClass){
                        if ( CLASS_LIST_COMPAT ) {
                          if ( replacedClass )
                            node.classList.remove(module.exports.ZenParser.escapeHTML(replacedClass))
                          node.classList.add(module.exports.ZenParser.escapeHTML(newClass))
                        } else {
                          if ( replacedClass )
                            node.className = node.className.replace(" "+module.exports.ZenParser.escapeHTML(replacedClass), function(){ return " "+module.exports.ZenParser.escapeHTML(newClass) })
                          else
                            node.className += " "+module.exports.ZenParser.escapeHTML(newClass)
                        }
                    }

                    return function(stream, input, output, node, rawClassName, model, vars, hit, onupdate, lastValue){
                        node = input.buffer
                        rawClassName = input.pile
                        model = input.data
                        vars = []

                        while ( hit = (rtemplatevars.exec(rawClassName)||[])[1], hit )
                          if ( vars.indexOf(hit) == -1 )
                            vars.push(hit)

                        if ( vars.length ) {
                            onupdate = function(e, str, hit, i, l, value){
                                str = rawClassName
                                for ( i = 0, l = e.keys.length; i < l; i++ )
                                  if ( vars.indexOf(e.keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit ) {
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    value = model.getItem(vars[i])

                                    if ( value !== void 0 && value !== null )
                                      str = str.replace(new RegExp(templateVarGlyph+vars[i], "g"), function(){ return value })
                                  }

                                  requestAnimationFrame(function(){
                                      set(node, str, lastValue)
                                      lastValue = str
                                  })
                                }
                            }
                            input.update.push(onupdate)
                            onupdate({keys: vars})
                        }
                        else
                          set(node, rawClassName)
                    }
                }()
            }
          , "[": { enumerable: true,
                value: function(){
                    function attribute(stream, input, output, node, model, vars, pair, idx, rawKey, rawValue, hit, onupdate){
                        node = input.buffer
                        model = input.data
                        vars = []

                        pair = input.pile
                        idx = pair.search("=")

                        if ( idx == -1 )
                          rawKey = pair,
                          rawValue = "1"
                        else
                          rawKey = pair.split("=")[0],
                          rawValue = pair.slice(idx+1)

                        while ( hit = (rtemplatevars.exec(rawValue)||[])[1], hit )
                          if ( vars.indexOf(hit) == -1 )
                            vars.push(hit)

                        if ( vars.length ) {
                            onupdate = function(e, str, hit, i, l, value){
                                str = rawValue

                                for ( i = 0, l = e.keys.length; i < l; i++ )
                                  if ( vars.indexOf(e.keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit ) {
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    value = model.getItem(vars[i])

                                    if ( value !== void 0 && value !== null )
                                      str = str.replace(new RegExp(templateVarGlyph+vars[i], "g"), function(){ return value })
                                  }

                                  requestAnimationFrame(function(){
                                      node.setAttribute(module.exports.ZenParser.escapeHTML(rawKey), module.exports.ZenParser.escapeHTML(str))
                                  })
                                }
                            }
                            input.update.push(onupdate)
                            onupdate({keys: vars})
                        } else
                          node.setAttribute(module.exports.ZenParser.escapeHTML(rawKey), module.exports.ZenParser.escapeHTML(rawValue))
                    }

                    attribute.enclosing_glyph = "]"

                    return attribute
                }()
            }
          , "@": { enumerable: true,
                value: function assign_var(stream, input, output){
                    output.vars[input.pile] = output.vars[input.pile] || []
                    output.vars[input.pile].push(input.buffer)
                }
            }
          , "{": { enumerable: true,
                value: function(){
                    function textContent(stream, input, output, node, rawTextContent, model, vars, hit, onupdate){
                        node = function(node){
                            if ( node.nodeType === NODE.TEXT_NODE)
                              return node
                            return node.appendChild(DOCUMENT.createTextNode(""))
                        }(input.buffer)
                        rawTextContent = input.pile
                        model = input.data
                        vars = []

                        while ( hit = (rtemplatevars.exec(rawTextContent)||[])[1], hit )
                          if ( vars.indexOf(hit) == -1 )
                            vars.push(hit)

                        if ( vars.length ) {
                            onupdate = function(e, str, hit, i, l, value){
                                str = rawTextContent

                                for ( i = 0, l = e.keys.length; i < l; i++ )
                                  if ( vars.indexOf(e.keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit ) {
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    value = model.getItem(vars[i])

                                    if ( value !== void 0 && value !== null )
                                      str = str.replace(new RegExp(templateVarGlyph+vars[i], "g"), function(){ return value })
                                  }

                                  requestAnimationFrame(function(){
                                      node.nodeValue = str
                                  })
                                }
                            }
                            input.update.push(onupdate)
                            onupdate({keys: vars})
                        } else
                          node.nodeValue = rawTextContent||" "
                    }

                    textContent.enclosing_glyph = "}"

                    return textContent
                }()
            }
          , "(": { enumerable: true,
                value: function(){
                    function group(stream, input, output, rv, vars){
                        rv = module.exports.ZenParser.parse(input.pile, input.data)
                        input.buffer = rv.tree.childNodes.length == 1 ? rv.tree.childNodes[0] : rv.tree
                        vars = new Iterator(rv.vars)

                        while ( vars.next(), !vars.current.done ) {
                            output.vars[vars.current.key] = output.vars[vars.current.key] || []

                            while (vars.current.value.length)
                              output.vars[vars.current.key].push(vars.current.value.shift())
                        }
                    }

                    group.enclosing_glyph = ")"

                    return group
                }()
            }
        })

    var traverse = function(stream, input, output){
            operate(stream, input, output)

            if ( !input.traversal )
              input.context = output.tree.appendChild(input.buffer)
            else
              traversals[input.traversal](stream, input, output)
            input.traversal = input.glyph

            input.pile = ""
            input.glyph = ""
            input.operator = null
            if ( input.buffer && input.buffer.nodeType === NODE.ELEMENT_NODE )
              input.context = input.buffer
            input.buffer = null
        }

    var operate = function(autoVars){
            autoVars = ["A", "INPUT", "SUBMIT", "BUTTON"]

            return function(stream, input, output){
                input.pile = input.pile.trim()

                if ( !input.operator) {
                    input.buffer = !input.pile.length && input.glyph === "{" ? DOCUMENT.createTextNode("")
                                 : !input.pile.length && input.glyph !== "{" ? DOCUMENT.createElement("div")
                                 : input.pile === "§" ? DOCUMENT.createTextNode("")
                                 : DOCUMENT.createElement(input.pile)

                  if ( autoVars.indexOf(input.buffer.nodeName) != -1 )
                    input.pile = input.buffer.nodeName.toLowerCase(),
                    operators["@"](stream, input, output)
                }
                else
                  operators[input.operator](stream, input, output)

                input.pile = ""

                input.operator = input.glyph
            }
        }()

    var parse = function(stream, input, output, capture, ignore, openGlyph, closeGlyph){
            capture = false

            while ( stream.next(), !stream.current.done ) {
                input.glyph = stream.current.value

                  if ( !capture ) {
                    if ( traversals[input.glyph] )
                      traverse(stream, input, output)
                    else if ( operators[input.glyph] ) {
                        operate(stream, input, output)

                        if ( operators[input.glyph].hasOwnProperty("enclosing_glyph") ) {
                          capture = true
                          ignore = 0
                          openGlyph = input.glyph
                          closeGlyph = operators[input.glyph].enclosing_glyph
                        }
                    }
                    else
                      input.pile += input.glyph
                  } else {
                      if ( input.glyph === closeGlyph && !ignore )
                        capture = false
                      else {
                          if ( input.glyph === closeGlyph )
                            ignore--
                          else if ( input.glyph === openGlyph )
                            ignore++

                          input.pile += input.glyph
                      }
                  }
            }

            traverse(stream, input, output)

            output.vars.root = _.spread(output.tree.childNodes)

            if ( input.update )
              input.data.addEventListener("update", function(sequence, l){
                  return function(e, fns){
                      fns = [].concat(sequence)

                      while ( fns.length )
                        void function(fn){
                            //sInternalAnimationManager.queue(function(){
                                fn(e)
                            //})
                        }( fns.shift() )
                  }
              }(input.update, input.update.length))

            return output
        }

    Object.defineProperties(statics, {
        parse: { enumerable: true,
            value: function(expression, data){
                return new module.exports.ZenParser(expression).parse(data)
            }
        }
      , escapeHTML: { enumerable: true,
            value: function(dummy){
                return function(str){
                    dummy.nodeValue = str
                    return dummy.nodeValue
                }
            }( DOCUMENT.createTextNode("") )
        }
      , document: { enumerable: true,
            get: function(){
                return DOCUMENT
            }
          , set: function(v){
                return module.exports.setDocument.call(null, v)
            }
        }
    })

    return {
        constructor: function(expression){
            Object.defineProperty(this, "_expression", {
                value: _.typeof(expression) == "string" ? expression : ""
            })
        }
      , parse: { enumerable: true,
            value: function(data, stream, input, output){

                data = module.exports.ZView.isImplementedBy(data) ? data.model
                     : Model.isImplementedBy(data) ? data
                     : "string, object".indexOf(_.typeof(data)) != -1 ? new Model(data)
                     : new Model

                stream = new Iterator(this.expression)
                input = { data: data, update: [], pile: "", glyph: "", buffer: null, operator: null, traversal: null, context: null }
                output = { vars: {}, tree: DOCUMENT.createDocumentFragment() }

                return parse(stream, input, output)
            }
        }
      , expression: { enumerable: true,
            get: function(){
                return this._expression || ""
            }
        }
    }
})

module.exports.ZView = klass(EventTarget, function(statics){
    var views = Object.create(null)

    Object.defineProperties(statics, {
        getByUid: function(uid){
            return views[uid] ? views[uid].view : void 0
        }
      , document: { enumerable: true,
            get: function(){
                return DOCUMENT
            }
          , set: function(v){
                return module.exports.setDocument.call(null, v)
            }
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
            buffer = new module.exports.ZenParser(views[this.uid].template).parse(this)
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

                delete views[this.uid].view
            }
        }

      , Model: { enumerable: true,
            get: function(){ return views[this.uid].Model }
        }
    }

})
