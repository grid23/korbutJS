"use strict"

const fs = require("fs")
const klass = require("../class").class
const path = require("path")
const type = require("../utils").typeof

const Collection = require("../Collection").Collection
const Event = require("../Event").Event
const EventTarget = require("../EventTarget").EventTarget
const Model = require("../Model").Model

const wm = new WeakMap

module.exports.Mime = klass(EventTarget, function(statics){
    const MIMES = function(data){
        if ( data instanceof Error )
          throw data
        return Collection.CSVtoCollectionSync(data)
    }( fs.readFileSync(path.resolve(process.cwd(), __dirname, "./mimetypes.csv")) )


    Object.defineProperties(statics, {
        lookup: { enumerable: true,
            value: function(lookup, cb){
                let extname = (path.extname(lookup).length ? path.extname(lookup) : lookup).slice(1)
                let subset = MIMES.subset({extension: extname})
                let templates = []

                subset.forEach(function(m){
                    templates.push(m.getItem("template"))
                })

                subset.purge()

                if ( !templates.length ) {
                    let err = new Error("unable to determine a mimeType for " + extname)

                    if ( type(cb) == "function" )
                      cb(err, null)
                    else
                      return err
                }
                else {
                    if ( type(cb) == "function" )
                      cb.apply(null, [null].concat(templates))
                    else
                      return templates
                }
            }
        }
      , reverse_lookup: { enumerable: true,
            value: function(lookup, cb){
                let template = lookup.split(";")[0]
                let extensions = []
                let subset = MIMES.subset({template})

                subset.forEach(function(m){
                    extensions.push(m.getItem("extension"))
                })

                subset.purge()

                if ( !extentions.length ){
                    let err = new Error("unable to dertemine an extension for " + lookup)

                    if ( type(cb) == "function" )
                      cb(err, null)
                    else
                      return err
                }
                else {
                    if ( type(cb) == "function" )
                      cb.apply(null, [null].concat(extensions))
                    else
                      return extensions
                }
            }
        }
    })

    return {
        constructor: function(dict){
            dict = type(dict) == "object" ? dict
                 : type(dict) == "string" ? { filepath: dict }
                 : ""

            wm.set(this, Object.create(null))
            wm.get(this).filepath = dict.filepath
        }
      , lookup: { enumerable: true,
            value: function(){
                return module.exports.Mime.lookup(wm.get(this).filepath)
            }
        }
    }
})
