void function(){
    "use strict"
    var Promise = require("./Promise").Promise

    module.exports = new Promise(function(resolve, reject, ready){
        function onready(){
            if ( ready )
              return
            ready = true

            setTimeout(resolve, 4, {
                timestamp: Date.now()
              , nodes: {
                    documentElement: document.documentElement
                  , head: document.head
                  , body: document.body
                  , title: function(node){
                        if ( node ) return node
                        return document.head.appendChild(document.createElement("title"))
                    }( document.head.getElementsByTagName("title")[0] )
                  , viewport: function(node){
                        if ( node ) return node
                        node = document.createElement("meta")
                        node.setAttribute("name", "viewport")
                        node.setAttribute("content", "")
                        return document.head.appendChild(node)
                  }( document.head.querySelector("meta[name=viewport]") )
                }
            })
        }

        function isready(){
            return "interactive,complete".indexOf(document.readyState) != -1
        }

        if ( isready() )
          onready()
        else
            window.addEventListener("DOMContentLoaded", onready, true),
            window.addEventListener("load", onready, true),
            document.addEventListener("readystatechange", isready, true)
    })

}()