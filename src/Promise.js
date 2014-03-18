var klass = require("./class").class

module.exports.Promise = klass(function($static){
    $static.resolve = function(){}
    $static.reject = function(){}

    $static.all = function(){}
    $static.race = function(){}

    return {
        constructor: function(){}
      , then: function(){}
      , catch: function(){}
    }
})
