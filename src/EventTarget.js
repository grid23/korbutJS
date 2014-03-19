"use strict"

var klass = require("./class").class

module.exports.EventTarget = klass(function(Super, statics){

    return {
        constructor: function(){}
      , addEventListener: function(){}
      , removeEventListener: function(){}
      , dispatchEvent: function(){}
    }
})
