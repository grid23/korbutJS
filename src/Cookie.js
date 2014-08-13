"use strict"

var _ = require("./utils")
var klass = require("./class").class
var Model = require("./Model").Model

module.exports.Cookie = klass(Model, function(statics){

    return {
        constructor: function(){
            return this
        }
    }
})
