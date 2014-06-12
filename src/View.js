void function(){ "use strict"

    var _ = require("./utils")
    var klass = require("./class").class
    var Iterator = require("./Iterator").Iterator
    var Model = require("./Model").Model

    module.exports.ZenParser = klass(function(statics){
        var CLASS_LIST_COMPAT = Element.prototype.hasOwnProperty("classList")

        var rtemplatevars = /\$([^$\W]*)/g
        var templateVarGlyph = "$"

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

                                if ( hit )
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    value = model.getItem(vars[i])

                                    if ( value !== void 0 && value !== null )
                                      str = str.replace(templateVarGlyph+vars[i], function(){ return value }, "g")
                                  }

                                node.setAttribute("id", module.exports.ZenParser.escapeHTML(str))
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

                                    if ( hit )
                                      for ( i = 0, l = vars.length; i < l; i++ ) {
                                        value = model.getItem(vars[i])

                                        if ( value !== void 0 && value !== null )
                                          str = str.replace(templateVarGlyph+vars[i], function(){ return value }, "g")
                                      }

                                    set(node, str, lastValue)
                                    lastValue = str
                                }
                                input.update.push(onupdate)
                                onupdate({keys: vars})
                            }
                            else
                              set(node, rawClassName)
                        }
                    }()
                        /*function write(node, rawClassName, rawRemoveClassName){
                            if ( rawRemoveClassName )
                              if ( CLASS_LIST_COMPAT )
                                node.classList.remove(module.exports.ZenParser.escapeHTML(rawRemoveClassName))
                              else
                                node.className.replace(module.exports.ZenParser.escapeHTML(rawRemoveClassName), "")

                            if ( CLASS_LIST_COMPAT )
                              node.classList.add(module.exports.ZenParser.escapeHTML(rawClassName))
                            else
                              node.className += " "+module.exports.ZenParser.escapeHTML(rawClassName)
                        }

                        function set(node, rawClassName){
                            write(node, rawClassName)
                        }

                        return function classname(stream, input, output){
                            set(input.buffer, input.pile)
                        }
                    }()*/
                }
              , "[": { enumerable: true,
                    value: function(){
                        function write(node, rawKey, rawValue){
                            node.setAttribute(module.exports.ZenParser.escapeHTML(rawKey), module.exports.ZenParser.escapeHTML(rawValue))
                        }

                        function set(node, attr, key, value, idx){
                            idx = attr.search("=")

                            if ( idx < 1 )
                              throw new Error("korbut.ZenParser.parse, malformatted attribute substring")

                            key = attr.split("=")[0]
                            value = attr.slice(idx+1)

                            write(node, key, value)
                        }

                        function attribute(stream, input, output){
                            set(input.buffer, input.pile)//[input.pile.length-1] === "]" ? input.pile.slice(0, input.pile.length-1) : input.pile)
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
                        function write(node, rawTextContent){
                            if ( node.nodeType === Node.ELEMENT_NODE )
                              node.appendChild(document.createTextNode(rawTextContent))
                            else if ( node.nodeType === Node.TEXT_NODE )
                              node.nodeValue = rawTextContent
                        }

                        function set(node, rawTextContent){
                            write(node, rawTextContent)
                        }

                        function textContent(stream, input, output, str){
                            set(input.buffer, input.pile)
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
                if ( input.buffer && input.buffer.nodeType === Node.ELEMENT_NODE )
                  input.context = input.buffer
                input.buffer = null
            }

        var operate = function(autoVars){
                autoVars = ["A", "INPUT", "SUBMIT", "BUTTON"]

                return function(stream, input, output){
                    input.pile = input.pile.trim()

                    if ( !input.operator) {
                        input.buffer = !input.pile.length && input.glyph === "{" ? document.createTextNode("")
                                     : !input.pile.length && input.glyph !== "{" ? document.createElement("div")
                                     : input.pile === "§" ? document.createTextNode("")
                                     : document.createElement(input.pile)

                      if ( autoVars.indexOf(input.buffer.nodeName) != -1 )
                        input.pile = input.buffer.nodeName.toLowerCase(),
                        operators["$"](stream, input, output)
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
                      return function(e, i){
                          for ( i = 0; i < l; i++ )
                            sequence[i](e)
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
                }( document.createTextNode("") )
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
                    data = module.exports.View.isImplementedBy(data) ? data.model
                         : Model.isImplementedBy(data) ? data
                         : "string, object".indexOf(_.typeof(data)) != -1 ? new Model(data)
                         : new Model
                    stream = new Iterator(this.expression)
                    input = { data: data, update: [], pile: "", glyph: "", buffer: null, operator: null, traversal: null, context: null }
                    output = { vars: {}, tree: document.createDocumentFragment() }

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

    module.exports.View = klass(function(statics){
        Object.defineProperties(statics, {

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
            constructor: function(args, handler, data, dict, expression, buffer, events){
                args = _.spread(arguments)
                handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : null
                data = Model.isImplementedBy(args[args.length-1]) ? args.pop()
                     : args.length > 1 && "string, object".indexOf(_.typeof(args[args.length-1])) != -1 ? new this.Model(args.pop())
                     : new this.Model
                dict = _.typeof(args[args.length-1]) == "string" ? { template: args.pop() }
                     : _.typeof(args[args.length-1]) == "object" ? args.pop()
                     : {}

                expression = _.typeof(dict.template) == "string" ? dict.template : ""
                buffer = new this.Template(expression).parse(this)

                Object.defineProperties(this, {
                    _template: { value: expression }
                  , _dict: { value: dict }
                  , _model: { value: data }
                  , _vars: { value: buffer.vars }
                  , _fragment: { value: buffer.tree }
                })

                _.typeof(this._DOMEvents) == "object" && addEventListeners(this, this._DOMEvents)
                _.typeof(dict.events) == "object" && addEventListeners(this, dict.events)
            }
          , root: { enumerable: true,
                value: function(root){
                    root = this.queryAll("root")

                    return root.length > 1 ? root : root[0]
                }
            }
          , query: { enumerable: true,
                value: function(query){
                    if ( this._vars.hasOwnProperty(query) )
                      return this._vars[query][0]
                    return null
                }
            }
          , queryAll: { enumerable: true,
                value: function(query){
                    if ( this._vars.hasOwnProperty(query) )
                      return [].concat(this._vars[query])
                    return []
                }
            }
          , clone: { enumerable: true,
                value: function(){
                    return new this.constructor(this._dict, this.model)
                }
            }

          , model: { enumerable: true,
                get: function(){
                    return this._model
                }
            }
          , template: { enumerable: true,
                get: function(){
                    return this._template
                }
            }

          , Model: {
                enumerable: true,
                get: function(){
                    return this._Model || Model
                }
            }
          , Template: { enumerable: true,
                get: function(){
                    return this._Template || module.exports.ZenParser
                }
            }
        }

    })

}()
