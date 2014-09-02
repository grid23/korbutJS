"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID
var Event = require("./EventTarget").Event
var EventTarget = require("./EventTarget").EventTarget
var Iterator = require("./Iterator").Iterator
var Promise = require("./Promise").Promise
var ZenParser = require("./ZView").ZenParser
var Serializer = require("./Serializer").Serializer
var domReady = require("./domReady")
var requestAnimationFrame = require("./requestAnimationFrame").requestAnimationFrame
var isSameDomain = require("./isSameDomain").isSameDomain

module.exports.CssTextUpdateEvent = klass(Event, {
    constructor: function(cssRule){
        Event.call(this, "csstextupdate")

        this.cssRule = cssRule
        this.selectorText = cssRule.selectorText
        this.cssText = cssRule.cssText
    }
  , selectorText: { enumerable: true,
        get: function(){ return this._selectorText }
      , set: function(v){ !this._cssText && Object.defineProperty(this, "_selectorText", { value: v }) }
    }
  , cssText: { enumerable: true,
        get: function(){ return this._cssText }
      , set: function(v){ !this._cssText && Object.defineProperty(this, "_cssText", { value: v }) }
    }
  , cssRule: { enumerable: true,
        get: function(){ return this._cssRule }
      , set: function(v){ !this._cssText && Object.defineProperty(this, "_cssRule", { value: v }) }
    }
})

module.exports.CSSRule = klass(EventTarget, function(statics){
    var rules = Object.create(null)
    var serializer = new Serializer({ delimiter: ":", separator: ";" })
    var rcssparse = /(?:\s|$)*(\S*)(?:\s|$)*{(.*)}(?:\s|$)*/

    Object.defineProperties(statics, {
        serializeCssText: { enumerable: true,
            value: function(o){
                return serializer.serialize(o)
            }
        }
      , objectifyCssText: { enumerable: true,
            value: function(str){
                return serializer.objectify(str)
            }
        }
    })

    return {
        constructor: function(selectorText, cssText, fromstr, dummy, args){
            args = _.spread(arguments)
            dummy = document.createElement("div")

            selectorText = _.typeof(args[0]) == "string" && isNaN(+args[0]) ? args.shift()
                         : (fromstr = true, args.shift(), (rcssparse.exec(args[0])||[])[1]||"")

            cssText = dummy.style.cssText = fromstr ? (rcssparse.exec(args.pop())||[])[2]||""
                    : _.typeof(args[args.length-1]) == "string" ? args.pop()
                    : _.typeof(args[args.length-1]) == "object" ? module.exports.CSSRule.serializeCssText(args.pop())
                    : ""

            rules[this.uid] = Object.create(null, {
                instance: { value: this }
              , dummy: { value: dummy }
              , selectorText: { writable: true, value: selectorText}
              , cssText: { writable: true, value: cssText }
            })
        }

      , getProperty: { enumerable: true,
            value: function(){
                return CSSStyleDeclaration.prototype.getPropertyValue.apply(rules[this.uid].dummy.style, arguments)
            }
        }
      , setProperty: { enumerable: true,
            value: function(o, n){
                o = rules[this.uid].dummy.style.cssText
                CSSStyleDeclaration.prototype.setProperty.apply(rules[this.uid].dummy.style, arguments)
                n = rules[this.uid].dummy.style.cssText

                if ( o !== n )
                  this.dispatchEvent(new module.exports.CssTextUpdateEvent(this))
            }
        }

      , selectorText: { enumerable: true,
            get: function(){
                return rules[this.uid].selectorText
            }
        }
      , cssText: { enumerable: true,
            get: function(){
                return rules[this.uid].dummy.style.cssText
            }
        }
      , toString: { enumerable: true,
            value: function(){
                return [this.selectorText, "{", this.cssText, "}"].join("")
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                delete rules[this.uid]
            }
        }
    }
})

module.exports.Stylesheet = klass(EventTarget, function(statics){
    var stylesheets = Object.create(null)
    var BLOB_COMPAT = function(blob, url){
            try {
                blob = new Blob([""], { type: "text/plain" })
                url = URL.createObjectURL(blob)

                if ( "msClose" in blob ) // on ie10 (+?), blobs are treated like x-domain files, making them unwritable
                  throw new Error
            } catch(e){
                return false
            }

            return true
        }()

    Object.defineProperties(statics, {
        isLocalFile: { enumerable: true,
            value: isSameDomain
        }
      , getByUid: function(uid){
            return stylesheets[uid] ? stylesheets[uid].instance : void 0
        }
    })

    return {
        constructor: function(dict, rules, node, args, blob){
            stylesheets[this.uid] = Object.create(null)
            stylesheets[this.uid].instance = this
            stylesheets[this.uid].writable = true
            stylesheets[this.uid].rules = []

            args = _.spread(arguments)
            rules = _.typeof(args[args.length-1]) == "array" ? [].concat(args.pop()) : []
            dict = _.typeof(args[args.length-1]) == "object" ? args.pop() : { node: args.pop() }

            node = function(node){
                if ( node && node.nodeType == Node.ELEMENT_NODE )
                  if ( node.nodeName == "STYLE" )
                    return node
                  else if ( node.nodeName == "LINK" )
                    return node

                node = function(type, url){
                    if ( type == "string" ) {
                      if ( !module.exports.Stylesheet.isLocalFile(node) )
                        stylesheets[this.uid].writable = false

                      node = ZenParser.parse("link#$id[rel=stylesheet][href=$href]", { id: this.uid, href: node }).tree.childNodes[0]
                    }
                    else if ( this.BLOB_COMPAT ) {
                      blob = new Blob(rules, { type: "text/css" })
                      url = URL.createObjectURL(blob)

                      node = ZenParser.parse("link#$id[rel=stylesheet][href=$href]", { id: this.uid, href: url }).tree.childNodes[0]
                    }
                    else
                      node = ZenParser.parse("style#$id>§{$rules}", { id: this.uid, rules: rules.splice(0).join("\n") }).tree.childNodes[0]

                    domReady.then(function(e){
                        e.nodes.head.appendChild(node)
                    })

                    return node
                }.call(this, _.typeof(node))

                return node
            }.call(this, dict.node||dict.href||void 0)

            stylesheets[this.uid].dfd = new Promise(function(resolve, reject, start){
                function wait(){
                    if ( !node.sheet )
                      if ( Date.now() - start > 5000)
                        return reject(new Error("timeout"))
                      else
                        return setTimeout(wait.bind(this), 4)

                    stylesheets[this.uid].sheet = node.sheet

                    if ( dict.media )
                      this.media = dict.media

                    if ( !!dict.disabled )
                      this.disable()

                    if ( !blob && stylesheets[this.uid].writable )
                        this.insertRule(rules)

                    requestAnimationFrame(resolve)
                }

                start = Date.now()
                wait.call(this)
            }.bind(this))

        }
      , insertRule: { enumerable: true,
            value: function(args, cb, iterator, rv){
                if ( !stylesheets[this.uid].writable ) {
                    if ( _.typeof(arguments[arguments.length-1]) == "function" )
                      arguments[arguments.length-1].call(this, new Error("stylesheet is read-only"))
                    return null
                }

                if (stylesheets[this.uid].dfd.state != Promise.RESOLVED ) {
                  args = arguments

                  stylesheets[this.uid].dfd.then(function(){
                      module.exports.Stylesheet.prototype.insertRule.apply(this, args)
                  }.bind(this))

                  return []
                }

                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : Function.prototype
                iterator = new Iterator( (args.length>1 || module.exports.CSSRule.isImplementedBy(args[0])) ? args : args[0]||[])
                rv = []

                while ( !iterator.next().done )
                  void function(iteration, cssRule, idx, buff, k){
                      if ( _.typeof(iteration.value) == "object" ) {
                          rv.push( module.exports.Stylesheet.prototype.insertRule.call(this, iteration.value) )
                          return
                      }

                      if ( _.typeof(iteration.value) == "array" ) {
                          rv.push( module.exports.Stylesheet.prototype.insertRule.apply(this, [iteration.value]) )
                          return
                      }

                      cssRule = module.exports.CSSRule.isImplementedBy(iteration.value) ? iteration.value
                              : new module.exports.CSSRule(iteration.key, iteration.value)

                      idx = stylesheets[this.uid].sheet.cssRules.length
                      stylesheets[this.uid].rules[idx] = cssRule
                      rv.push(cssRule)

                      stylesheets[this.uid].sheet.insertRule(cssRule.toString(), idx)

                      cssRule.addEventListener("csstextupdate", function(e, idx){
                          if ( idx = stylesheets[this.uid].rules.indexOf(e.cssRule), idx != -1 )
                            requestAnimationFrame(function(){
                                stylesheets[this.uid].sheet.cssRules[idx].style.cssText = e.cssText
                            }.bind(this))
                      }.bind(this))
                  }.call(this, iterator.current)

                cb.apply(this, [].concat(null, rv))
                return rv.length > 1 ? rv : rv[0]
            }
        }
      , deleteRule: { enumerable: true,
            value: function(args, hit){
                if ( !stylesheets[this.uid].writable ) return null

                if (stylesheets[this.uid].dfd.state != Promise.RESOLVED ) {
                  args = arguments

                  stylesheets[this.uid].dfd.then(function(){
                      module.exports.Stylesheet.prototype.deleteRule.apply(this, args)
                  }.bind(this))

                  return null
                }

                args = _.spread(arguments)
                iterator = new Iterator(args)
                hit = 0

                stylesheets[this.uid].dfd.then(function(){
                    while ( !iterator.next().done )
                      void function(iteration, idx){
                          if ( !module.exports.CSSRule.isImplementedBy(iteration.value) )
                            return

                          while ( idx = stylesheets[this.uid].rules.indexof(e.cssRule), idx != -1 )
                            stylesheets[this.uid].sheet.deleteRule(idx), hit++

                      }.call(this, iterator.current)
                }.bind(this))

                return hit
            }
        }

      , enable: { enumerable: true,
            value: function(rv){
                stylesheets[this.uid].dfd.then(function(){
                    if ( stylesheets[this.uid].sheet.disabled )
                      stylesheets[this.uid].sheet.disabled = false,
                      rv = true
                }.bind(this))
                return !!rv
            }
        }
      , disable: { enumerable: true,
            value: function(rv){
                stylesheets[this.uid].dfd.then(function(){
                    if ( !stylesheets[this.uid].sheet.disabled )
                      stylesheets[this.uid].sheet.disabled = true,
                      rv = true
                }.bind(this))
                return !!rv
            }
        }
      , media: { enumerable: true,
            get: function(rv){
                stylesheets[this.uid].dfd.then(function(){
                    rv = stylesheets[this.uid].sheet.media.mediaText
                }.bind(this))
                return rv
            }
          , set: function(v){
                v = _.typeof(v) == "string" ? v : Object.prototype.toString(v)
                stylesheets[this.uid].dfd.then(function(){
                    stylesheets[this.uid].sheet.media.mediaText = v
                }.bind(this))
            }
        }

      , sheet: { enumerable: true,
            get: function(){
                return stylesheets[this.uid].sheet
            }
        }

      , BLOB_COMPAT: { enumerable: true,
            get: function(){ return BLOB_COMPAT }
        }
      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                EventTarget.prototype.purge.call(this)
                delete stylesheets[this.uid]
            }
        }
    }
})


























/*


module.exports.CSSStyleDeclaration2 = klass(function(statics){

    return {
        constructor: function(){

        }
      , setProperty: { enumerable: true,
            value: function(){}
        }
      , getProperty: { enumerable: true,
            value: function(){}
        }
      , removeProperty: { enumerable: true,
            value: function(){

            }
        }
      , setPropertyPriority: { enumerable: true,
            value: function(){

            }
        }
      , getPropertyPriority: { enumerable: true,
            value: function(){

            }
        }
      , priority: { enumerable: true,
            value: function(){}
        }
    }
})

module.exports.Stylesheet2 = klass(function(statics){
    var stylesheets = Object.create(null)

    var BLOB_COMPAT = function(blob, url){
            try {
                blob = new Blob([""], { type: "text/plain" })
                url = URL.createObjectURL(blob)

                if ( "msClose" in blob ) // on ie10 (+?), blobs are treated like x-domain files, making them unwritable
                  throw new Error
            } catch(e){
                return false
            }

            return true
        }()

    Object.defineProperties(statics, {
        isLocalFile: { enumerable: true,
            value: function(a){
                return function(path){
                    a.href = path
                    return a.domain === location.domain
                }
            }( document.createElement("a") )
        }
      , getByUid: function(uid){
            return stylesheets[uid] ? stylesheets[uid].stylesheet : void 0
        }
    })

    return {
        constructor: function(node, rules, resolver, isfile, args){
            args = _.spread(arguments)
            resolver = _.typeof(args[args.length-1] == "function") ? args.pop() : null
            rules = _.typeof(args[args.length-1]) == "array" ? [].concat(args.pop()) : [""]
            node = function(node){
                if ( node && node.nodeType == Node.ELEMENT_NODE )
                  if ( node.nodeName == "STYLE" )
                    return node
                  else if ( node.nodeName == "LINK" && module.exports.Stylesheet.isLocalFile(node.href) )
                    return node

                node = function(type, blob, url){
                    if ( type == "string" && module.exports.Stylesheet.isLocalFile(node) )
                      node = ZenParser.parse("link#$id[rel=stylesheet][href=$href]", { id: this.uid, href: node }).tree.childNodes[0]
                    else if ( this.BLOB_COMPAT ) {
                      blob = new Blob(rules, { type: "text/css" })
                      url = URL.createObjectURL(blob)

                      node = ZenParser.parse("link#$id[rel=stylesheet][href=$href]", { id: this.uid, href: url }).tree.childNodes[0]
                    }
                    else
                      node = ZenParser.parse("style>§{}").tree.childNodes[0]

                    domReady.then(function(e){
                        e.nodes.head.appendChild(node)
                    })

                    return node
                }.call(this, _.typeof(node))

                return node
            }.call(this, args.pop())

            stylesheets[this.uid] = { stylesheet: this, readyDFD: null, sheet: null }

            stylesheets[this.uid].readyDFD = new Promise(function(resolve, reject, start){
                function wait(){
                    if ( !node.sheet )
                      if ( Date.now() - start > 5000 )
                        return setTimeout(wait, 16)
                      else
                        reject("timeout")

                    resolve(node.sheet)
                }

                start = Date.now()

                wait()
            }).then(function(sheet){
                stylesheets[this.uid].sheet = sheet

                if ( !blob )
                  while ( rules.length )
                    this.insertRule(rules.shift())

                if ( resolver )
                  resolver(this)
            }.bind(this))
        }

      , BLOB_COMPAT: { enumerable: true,
            get: function(){ return BLOB_COMPAT }
        }

      , insertRule: { enumerable: true,
            value: function(){

            }
        }
      , removeRule: { enumerable: true,
            value: function(){

            }
        }

      , enable: { enumerable: true,
            value: function(){

            }
        }
      , disable: { enumerable: true,
            value: function(){

            }
        }
      , media: { enumerable: true,
            get: function(){}
          , set: function(){}
        }

      , sheet: { enumerable: true,
            get: function(){ return this._sheet }
          , set: function(v){ if ( !this._sheet ) Object.defineProperty(this, "_sheet", { value: v }) }
        }
      , readyDFD: { enumerable: true,
            get: function(){ return this._readyDFD }
          , set: function(v){ if ( !this._readyDFD ) Object.defineProperty(this, "_readyDFD", { value: v }) }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){
                return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid
            }
        }
    }
})
*/
