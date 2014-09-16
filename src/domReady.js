"use strict"

var Promise = require("./Promise").Promise
var klass = require("./class").class
var Event = require("./EventTarget").Event

var DomReadyEvent = klass(Event, {
        constructor: function(){
            Event.call(this, "domReady")

            Object.defineProperties(this, {
                _nodes: {
                    value: Object.create({}, {
                        documentElement: { enumerable: true, value: document.documentElement }
                      , head: { enumerable: true, value: document.head }
                      , body: { enumerable: true, value: document.body }
                      , title: { enumerable: true,
                            value: function(node){
                                if ( node ) return node
                                return document.head.appendChild(document.createElement("title"))
                            }( document.head.getElementsByTagName("title")[0] )
                        }
                      , viewport: { enumerable: true,
                            value: function(node){
                                if ( node ) return node
                                node = document.createElement("meta")
                                node.setAttribute("name", "viewport")
                                node.setAttribute("content", "")
                                return document.head.appendChild(node)
                            }( document.head.querySelector("meta[name=viewport]") )
                        }
                    })
                }
            })
        }
      , nodes: { enumerable: true,
            get: function(){
                return this._nodes || {}
            }
        }
    })

module.exports = new Promise(function(resolve, reject, ready){
    function onready(){
        if ( ready )
          return
        ready = true

        setTimeout(function(){
            resolve(new DomReadyEvent)
        }, 4)
    }

    function isready(){
        return "interactive,complete".indexOf(document.readyState) != -1 ? (onready(), true) : false
    }

    if ( !isready() )
      window.addEventListener("DOMContentLoaded", onready, true),
      window.addEventListener("load", onready, true),
      document.addEventListener("readystatechange", isready, true)
})
