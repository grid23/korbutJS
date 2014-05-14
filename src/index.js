void function(ns){ "use strict"

    var domReady = require("./domReady")
    var korbut = function(cb){
            if ( typeof cb == "function" )
              domReady.then(cb.bind(null))
        }

    Object.defineProperties(korbut, {
        utils: { enumerable: true, value: require("./utils") }
      , class: { enumerable: true, value: require("./class").class }
      , singleton: { enumerable: true, value: require("./class").singleton }

      , Iterator: { enumerable: true, value: require("./Iterator").Iterator }

      , EventTarget: { enumerable: true, value: require("./EventTarget").EventTarget }
      , Event: { enumerable: true, value: require("./Event").Event }

      , CustomEvent: { enumerable: true, value: require("./CustomEvent").CustomEvent }
      , PointerEvent: { enumerable: true, value: require("./PointerEvent").PointerEvent }

      , Promise: { enumerable: true, value: require("./Promise").Promise }

      , Router: { enumerable: true, value: require("./Router").Router }
      , Route: { enumerable: true, value: require("./Route").Route }

      , View: { enumerable: true, value: require("./View").View }
      , Template: { enumerable: true, value: require("./Template").Template }
      , Stylesheet: { enumerable: true, value: require("./Stylesheet").Stylesheet }
      , Transition: { enumerable: true, value: require("./Transition").Transition }
      , Animation: { enumerable: true, value: require("./Animation").Animation }
      , ClientRect: { enumerable: true, value: require("./ClientRect").ClientRect }

      , Model: { enumerable: true, value: require("./Model").Model }
      , Collection: { enumerable: true, value: require("./Collection").Collection }
      , Cookie: { enumerable: true, value: require("./Cookie").Cookie }
      , WebStore: { enumerable: true, value: require("./WebStore").WebStore }

      , UID: { enumerable: true, value: require("./UID").UID }
      , Serializer: { enumerable: true, value: require("./Serializer").Serializer }
    })

    window.korbut = korbut

}( { version: "korbutJS-ES5-x.y.z-t" } )
