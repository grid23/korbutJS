"use strict"

module.exports.isSameDomain = function(a){
    return function(path){
        a.href = path

        return a.hostname === location.hostname ? true
             : !a.hostname ? true // ie doesn't set the hostname if not "necessary"
             : false
    }
}( document.createElement("a") )
