void function(korbutJS, define){

    korbutJS.utils = require("./utils")
    korbutJS.class = require("./class").class
    korbutJS.singleton = require("./class").singleton

    //korbutJS.Event = require("./Event")
    //korbutJS.EventTarget = require("./EventTarget")

    if ( typeof define == "function" && define.amd )
      define(function(require, module, exports){
          module.exports = korbutJS
      })
    else
      window.korbutJS = korbutJS
}( { version: "x.y.z-t" }, window.define )
