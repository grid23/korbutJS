void function(ns){ "use strict"

    ns.class = require("./class").class
    ns.singleton = require("./class").singleton

    ns.Iterator = require("./Iterator").Iterator

    ns.EventTarget = require("./EventTarget").EventTarget
    ns.Event = require("./Event").Event

    ns.Promise = require("./Promise").Promise

    ns.Router = require("./Router").Router
    ns.Route = require("./Route").Route

    ns.UID = require("./UID").UID
    ns.Serializer = require("./Serializer").Serializer

    window.k = ns
}( { version: "korbutJS-ES5-x.y.z-t" } )
