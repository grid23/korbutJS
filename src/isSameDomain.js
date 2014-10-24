"use strict"

console.warn("src/isSameDomain is deprecated.")

module.exports.isSameDomain = function(a){
    return function(path){
        a.href = path
        return a.hostname === location.hostname
    }
}( document.createElement("a") )
