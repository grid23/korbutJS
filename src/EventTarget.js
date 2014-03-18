var klass = require("./class").class

module.exports.EventTarget = klass(function($static){

    return {
        constructor: function(){}
      , addEventListener: function(){}
      , removeEventListener: function(){}
      , dispatchEvent: function(){}
    }
})
