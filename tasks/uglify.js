"use strict"

var uglify = require("uglify-js")
var fs = require("fs")
var path = require("path")
var q = require("q")
var main, dest, options

main = path.join(__dirname, "../dist/korbut.js")
dest = path.join(__dirname, "../dist/korbut.min.js")

options = {
    strict: true
  , rpreserve: /(\$[0-9a-zA-Z_$]*)/g
  , compressor: {
        sequences: true
      , properties: true
      , dead_code: true
      , drop_debugger: true
      , unsafe: false
      , conditionals: true
      , evaluate: true
      , loops: true
      , unused: true
      , hoist_funs: true
      , hoist_vars: true
      , if_return: true
      , join_vars: true
      , cascade: true
      , warnings: true
      , negate_iife: true
      , pure_getters: false
      , pure_funcs: false
      , drop_console: true
  }
  , mangle: {
        reserved: []
    }
  , outputStream: {
        beautify: false
      , indent_level: 2
      , indent_start: 0
      , space_colon: false
      , ascii_only: true
      , inline_script: true
      , bracketize: false
      , semicolons: true
      , preamble: null
      , "max-line-len": 32000
    }
}

module.exports.uglify = function(dfd, compressor, reserved, ast){
    dfd = q.defer()

    fs.readFile(main, "utf8", function(err, buffer){
        if ( err )
          return dfd.reject(err)

        compressor = uglify.Compressor(options.compressor||{})
        reserved = function(reserved){
            var match = buffer.match(options.rpreserve)
              , i, l

            for ( i = 0, l = (match||[]).length; i < l; i++ )
              if ( reserved.indexOf(match[i]) == -1 )
                reserved.push(match[i])

            return reserved.join(",")
        }( [].concat((options.mangle||{})["reserved"]||[]) )

        try {
            ast = uglify.parse(buffer)
            ast.figure_out_scope()
            ast.transform(compressor)
            ast.figure_out_scope()

            if ( options.mangle )
              ast.mangle_names({ except: reserved })
        } catch(err) {
            console.log(err)
            return dfd.reject(err)
        }

        fs.writeFile(dest, ast.print_to_string(), "utf8", function(err){
            if ( err )
              return dfd.reject(err)

            dfd.resolve()
        })
    })

    return dfd.promise
}
