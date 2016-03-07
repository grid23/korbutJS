"use strict"

var _ = require("../utils")
var klass = require("../class").class
var requestAnimationFrame = function(){}
var cancelAnimationFrame = function(fn){ return fn() }
var jsdom = require("jsdom")

var Iterator = require("../Iterator").Iterator
var Model = require("../Model").Model
var UID = require("../UID").UID

var document = jsdom.jsdom()
var window =  document.defaultView
var Element = window.Element
var HTMLElement = window.HTMLElement
var Node = window.Node

module.exports.namespaces = {
    html: "http://www.w3.org/1999/xhtml"
  , svg: "http://www.w3.org/2000/svg"
  , xml: "http://www.w3.org/XML/1998/namespace"
  , xmlns: "http://www.w3.org/2000/xmlns/"
}

module.exports.ZParser = klass(function(statics){
    var CLASS_LIST_COMPAT = (Element.prototype.hasOwnProperty("classList") || HTMLElement.prototype.hasOwnProperty("classList")) && function(){
        try {
            document.createElementNS("http://www.w3.org/2000/svg", "svg").classList.add("x")
            return true
        } catch(e){}
        return false
    }()

    var rtemplatevars = /\$([^$£\s]*)/g
    var rustemplatevars = /£([^$£\s]*)/g

    var templateVarGlyph = "\\$"
    var us_templateVarGlyph = "£"

    var namespaces = module.exports.namespaces

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
                            function exec(){ node.setAttribute("id", module.exports.ZParser.escapeHTML(str)) }
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

                              if ( input.done )
                                requestAnimationFrame(exec)
                              else
                                exec()
                            }
                        }

                        input.update.push(onupdate)
                        onupdate({keys: vars})
                    } else
                        node.setAttribute("id", module.exports.ZParser.escapeHTML(rawid))
                }
            }
          , ".": { enumerable: true,
                value: function(){
                    function set(node, newClass, replacedClass){
                            if ( CLASS_LIST_COMPAT ) {
                              if ( replacedClass )
                                node.classList.remove(module.exports.ZParser.escapeHTML(replacedClass))
                              node.classList.add(module.exports.ZParser.escapeHTML(newClass))
                            } else {

                              if ( replacedClass )
                                node.setAttribute("class", node.getAttribute("class").replace(" "+module.exports.ZParser.escapeHTML(replacedClass), function(){ return " "+module.exports.ZParser.escapeHTML(newClass) }))
                              else
                                node.setAttribute("class", (node.getAttribute("class")||"")+ " "+module.exports.ZParser.escapeHTML(newClass))
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
                                function exec(){
                                    set(node, str, lastValue)
                                    lastValue = str
                                }

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

                                  if ( input.done )
                                    requestAnimationFrame(exec)
                                  else
                                    exec()

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
                                function exec(split, ns, key){
                                    split = module.exports.ZParser.escapeHTML(rawKey).split(":")
                                    ns = namespaces[split[0].toLowerCase()] ? split.shift().toLowerCase() : null
                                    key = split[0]

                                    if ( ns )
                                        node.setAttributeNS(ns, key, module.exports.ZParser.escapeHTML(str))
                                    else
                                        node.setAttribute(key, module.exports.ZParser.escapeHTML(str))
                                }
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

                                  if ( input.done )
                                    requestAnimationFrame(exec)
                                  else
                                    exec()

                                }
                            }
                            input.update.push(onupdate)
                            onupdate({keys: vars})
                        } else
                          void function(split, ns, key){
                              split = module.exports.ZParser.escapeHTML(rawKey).split(":")
                              ns = namespaces[split[0].toLowerCase()] ? namespaces[split.shift().toLowerCase()] : null
                              key = split[0]

                              if ( ns )
                                  node.setAttributeNS(ns, key, module.exports.ZParser.escapeHTML(rawValue))
                              else
                                  node.setAttribute(key, module.exports.ZParser.escapeHTML(rawValue))
                          }()
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
                    function textContent(stream, input, output, node, rawTextContent, model, vars, us_vars, hit, onupdate){
                        node = input.buffer
                        rawTextContent = input.pile
                        model = input.data
                        vars = []
                        us_vars = []

                        while ( hit = (rtemplatevars.exec(rawTextContent)||[])[1], hit )
                          if ( vars.indexOf(hit) == -1 )
                            vars.push(hit)

                        while ( hit = (rustemplatevars.exec(rawTextContent)||[])[1], hit )
                          if ( us_vars.indexOf(hit) == -1 )
                            us_vars.push(hit)

                        if ( vars.length || us_vars.length ) {
                            onupdate = function(e, str, hit, i, l, value){
                                function exec(){
                                    if ( node.nodeType === Node.TEXT_NODE )
                                      node.nodeValue = str
                                    else
                                      node.innerHTML = str
                                }

                                str = rawTextContent

                                for ( i = 0, l = e.keys.length; i < l; i++ )
                                  if ( vars.indexOf(e.keys[i]) != -1 || us_vars.indexOf(e.keys[i]) != -1 ) {
                                      hit = true
                                      break
                                  }

                                if ( hit ) {
                                  for ( i = 0, l = vars.length; i < l; i++ ) {
                                    value = model.getItem(vars[i])

                                    if ( value !== void 0 && value !== null )
                                      str = str.replace(new RegExp(templateVarGlyph+vars[i], "g"), function(){ return module.exports.ZParser.escapeHTML(value) })
                                  }

                                  for ( i = 0, l = us_vars.length; i < l; i++ ) {
                                    value = model.getItem(us_vars[i])

                                    if ( value !== void 0 && value !== null )
                                      str = str.replace(new RegExp(us_templateVarGlyph+us_vars[i], "g"), function(){ return value })
                                  }

                                  if ( input.done )
                                    requestAnimationFrame(exec)
                                  else
                                    exec()
                                }
                            }
                            input.update.push(onupdate)
                            onupdate({keys: vars})
                        } else
                          if ( node.nodeType === Node.TEXT_NODE )
                            node.nodeValue = rawTextContent||" "
                          else
                            node.textContent = rawTextContent||" "
                    }

                    textContent.enclosing_glyph = "}"

                    return textContent
                }()
            }
          , "(": { enumerable: true,
                value: function(){
                    function group(stream, input, output, rv, vars){
                        rv = module.exports.ZParser.parse(input.pile, input.data)
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

            return function(stream, input, output, split){
                input.pile = input.pile.trim()

                if ( !input.operator) {
                    input.buffer = !input.pile.length && input.glyph === "{" ? document.createTextNode("")
                                 : !input.pile.length && input.glyph !== "{" ? document.createElement("div")
                                 : input.pile === "§" ? document.createTextNode("")
                                 : input.pile.indexOf(":") == -1 ? document.createElement(input.pile)
                                 : (split = input.pile.split(":"), document.createElementNS(namespaces[split[0].toLowerCase()]||namespaces.hmtl, split[1]))

                  //if ( split )
                    //debugger

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

            input.done = true
            return output
        }

    Object.defineProperties(statics, {
        parse: { enumerable: true,
            value: function(expression, data){
                return new module.exports.ZParser(expression).parse(data)
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

                data = Model.isImplementedBy(data) ? data
                     : "string, object".indexOf(_.typeof(data)) != -1 ? new Model(data)
                     : new Model

                stream = new Iterator(this.expression)
                input = { data: data, update: [], pile: "", glyph: "", buffer: null, operator: null, traversal: null, context: null, done: false }
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
