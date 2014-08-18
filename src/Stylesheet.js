"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Iterator = require("./Iterator").Iterator
var EventTarget = require("./EventTarget").EventTarget
var UID = require("./UID").UID
var Promise = require("./Promise").Promise
var ZenParser = require("./ZView").ZenParser
var domReady = require("./domReady")

module.exports.CSSStyleDeclaration = klass(function(statics){

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

module.exports.Stylesheet = klass(function(statics){
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
