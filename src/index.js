"use strict"

var domReady = require("./domReady")
var korbut = function(cb){
        if ( typeof cb == "function" )
          domReady.then(cb.bind(null))
    }

Object.defineProperties(korbut, {
    version: { enumerable: true, value: "korbutJS-ES5-x.y.z-t" }
  , utils: { enumerable: true, value: require("./utils") }
  , class: { enumerable: true, value: require("./class").class }
  , singleton: { enumerable: true, value: require("./class").singleton }

  , domReady: { enumerable: true, value: domReady }

  , Iterator: { enumerable: true, value: require("./Iterator").Iterator }

  , EventTarget: { enumerable: true, value: require("./EventTarget").EventTarget }
  , Event: { enumerable: true, value: require("./EventTarget").Event }

  , PointerEvent: { enumerable: true, value: require("./PointerEvent").PointerEvent }

  , Promise: { enumerable: true, value: require("./Promise").Promise }

  , Router: { enumerable: true, value: require("./Router").Router }
  , Route: { enumerable: true, value: require("./Router").Route }

  , Service: { enumerable: true, value: require("./Service").Service }

  , View: { enumerable: true, value: require("./View").View }
  , Template: { enumerable: true, value: require("./View").Template}
  , ZView: { enumerable: true, value: require("./ZView").ZView}
  , ZenParser: { enumerable: true, value: require("./ZView").ZenParser }

  , CSSRule: { enumerable: true, value: require("./Stylesheet").CSSRule }
  , Stylesheet: { enumerable: true, value: require("./Stylesheet").Stylesheet }

  , CSSHook: { enumerable: true, value: require("./Stylesheet").CSSHook }
  , Transition: { enumerable: true, value: require("./Transition").Transition }
  //, Animation: { enumerable: true, value: require("./Animation").Animation }
  , Point: { enumerable: true, value: require("./ClientRect").Point }
  , Matrix: { enumerable: true, value: require("./ClientRect").Matrix }
  , ClientRect: { enumerable: true, value: require("./ClientRect").ClientRect }

  , Model: { enumerable: true, value: require("./Model").Model }
  , Collection: { enumerable: true, value: require("./Model").Collection }
  , Cookie: { enumerable: true, value: require("./Cookie").Cookie }
  , WebStore: { enumerable: true, value: require("./WebStore").WebStore }

  , UID: { enumerable: true, value: require("./UID").UID }
  , Serializer: { enumerable: true, value: require("./Serializer").Serializer }

  , IDB: { enumerable: true, value: require("./IDB").IDB }
  , IDBStore: { enumerable: true, value: require("./IDB").IDBStore }
  , IDBBroker: { enumerable: true, value: require("./IDB").IDBBroker }
  , LSDB: { enumerable: true, value: require("./LSDB").LSDB }
})

module.exports = window.korbut = korbut
