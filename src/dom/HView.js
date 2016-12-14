"use strict"

var hogan = require("hogan.js")
var klass = require("../class").class
var type = require("../utils").typeof

var Iterator = require("../Iterator").Iterator
var Model = require("../Model").Model
var Template = require("./Template").Template
var UID = require("../UID").UID
var View = require("./View").View

module.exports.HTemplate = klass(Template, function(statics){
    var templates = Object.create(null)
    var helpers = {
            "@": function(){
                return function(text){
                    return ' data-assign-var="'+text+'" '
                }
            }
        }

    Object.defineProperties(statics, {
        getByUid: { enumerable: true,
            value: function(uid){
                return templates[uid].instance
            }
        }
      , hogan: { enumerable: true,
            get: function(){ return hogan }
        }
      , helpers: { enumerable: true,
            get: function(){
                return helpers
            }
        }
      , registerHelper: { enumerable: true,
            value: function(k, v){
                helpers[k] = v
            }
        }
      , unregisterHelper: { enumerable: true,
            value: function(k){
                if ( helpers.hasOwnProperty(k)  )
                  delete helpers[k]
            }
        }
    })

    return {
        constructor: function(dict){
            dict = type(dict) == "object" ? dict
                 : type(dict) == "string" ? { template: dict }
                 : {}

            templates[this.uid] = Object.create(null, { instance: { value: this } })
            templates[this.uid].options = type(dict.options) == "object" ? dict.options : {}
            templates[this.uid].helpers = type(dict.helpers) == "object" ? dict.helpers : {}

            void function(tmpl){
                tmpl = tmpl || ""

                if ( type(tmpl) == "string" )
                  templates[this.uid].template = tmpl,
                  templates[this.uid].compiled_template = hogan.compile(tmpl, this.options)
                else if ( tmpl instanceof hogan.Template )
                  templates[this.uid].template = tmpl.text,
                  templates[this.uid].compiled_template = tmpl
                else
                  throw new Error("unable to understand template")
            }.call(this, dict.template)
        }
      , template: { enumerable: true,
            get: function(){ return templates[this.uid].template }
        }
      , options: { enumerable: true,
            get: function(){ return templates[this.uid].options }
        }
      , helpers: { enumerable: true,
            get: function(helpers, ite_g, ite_l){
                helpers = {}

                ite_g = new Iterator(module.exports.HTemplate.helpers)
                ite_l = new Iterator(templates[this.uid].helpers)

                while ( !ite_g.next().done )
                  helpers[ite_g.current.key] = ite_g.current.value

                while ( !ite_l.next().done )
                  helpers[ite_l.current.key] = ite_l.current.value

                return helpers
            }
        }
      , render: { enumerable: true,
            value: function(data, helpers_ite){
                data = JSON.parse( JSON.stringify( Model.isImplementedBy(data) ? data.raw : new Model(data).raw ) )

                helpers_ite = new Iterator(this.helpers)

                while ( !helpers_ite.next().done )
                  data[helpers_ite.current.key] = data[helpers_ite.current.key] || helpers_ite.current.value

                return templates[this.uid].compiled_template.render(data)
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){ delete templates[this.uid] }
        }
    }
})

module.exports.HView = klass(View, function(statics){

    return {
        constructor: function(){
            View.apply(this, arguments)
        }
      , _Template: module.exports.HTemplate
    }
})
