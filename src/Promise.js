"use strict"

var klass = require("./class").class

module.exports.Promise = klass(function(Super, statics){
    statics.resolve = function(){}
    statics.reject = function(){}

    statics.all = function(){}
    statics.race = function(){}

    return {
        constructor: function(){}
      , then: function(){}
      , catch: function(){}
    }
})
