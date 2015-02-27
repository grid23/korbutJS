"use strict"

if ( typeof window != "undefined" && typeof document != "undefined" )
  module.exports = require("./src/index.js")
else
  module.exports = {
      utils: require("./src/utils")
    , class: require("./src/class").class
    , singleton: require("./src/class").singleton

    , Iterator: require("./src/Iterator").Iterator

    , UID: require("./src/UID").UID
    , Serializer: require("./src/Serializer").Serializer

    , Promise: require("./src/Promise").Promise

    , EventTarget: require("./src/EventTarget").EventTarget
    , Event: require("./src/EventTarget").Event

    , Router: require("./src/Router").Router
    , Route: require("./src/Router").Route

    , Model: require("./src/Model").Model
    , Collection: require("./src/Model").Collection
  }
