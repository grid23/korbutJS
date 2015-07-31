"use strict"

var _ = require("../utils")
var klass = require("../class").class

module.exports.Template = klass({
    render: { enumerable: true, configurable: true,
        value: function(){ throw new Error("Template=>render(data) must be implemented by the inheriting class") }
    }
})
