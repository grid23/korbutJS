void function(ns){ "use strict"

    var domReady = require("./domReady")

    window.korbut = function(cb){
        if ( typeof cb == "function" )
            domReady.then(cb)
    }

    Object.defineProperties(window.korbut, {
        utils: { enumerable: true, value: require("./utils").utils }
      , class: { enumerable: true, value: require("./class").class }
      , singleton: { enumerable: true, value: require("./class").singleton }

      , Iterator: { enumerable: true, value: require("./Iterator").Iterator }

      , EventTarget: { enumerable: true, value: require("./EventTarget").EventTarget }
      , Event: { enumerable: true, value: require("./Event").Event }

      , Promise: { enumerable: true, value: require("./Promise").Promise }

      , Router: { enumerable: true, value: require("./Router").Router }
      , Route: { enumerable: true, value: require("./Route").Route }

      , UID: { enumerable: true, value: require("./UID").UID }
      , Serializer: { enumerable: true, value: require("./Serializer").Serializer }
    })

}( { version: "korbutJS-ES5-x.y.z-t" } )
