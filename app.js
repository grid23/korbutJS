"use strict"

const browserify = require("browserify")
const fs = require("fs")
const klass = require("./src/class").class
const type = require("./src/utils").typeof

const Iterator = require("./src/Iterator").Iterator
const Server = require("./src/server/Server").Server
const Watcher = require("./src/server/Watcher").Watcher
const ZView = require("./src/server/ZView").ZView

void function dev_server(){
    let server
    let watcher = new Watcher("./")

    let PageZView = klass(ZView, {
        constructor: function(){
            ZView.apply(this, arguments)

            void function(css){
                if ( !css )
                  return
                let iterator = new Iterator(css)

                while ( !iterator.next().done )
                  this.query("head").appendChild( new CSSZView(iterator.current.value).root )
            }.call(this, this.model.raw.css)

            void function(divs){
                if ( !divs )
                  return
                let iterator = new Iterator(divs)

                while ( !iterator.next().done )
                  this.query("body").appendChild( new DivZView(iterator.current.value).root )
            }.call(this, this.model.raw.divs)

            void function(scripts){
                if ( !scripts )
                  return
                let iterator = new Iterator(scripts)

                while ( !iterator.next().done )
                  this.query("body").appendChild( new ScriptZView(iterator.current.value).root )
            }.call(this, this.model.raw.scripts)
        }
      , _template: "html > (head@head > meta[charset=utf-8] ) + body@body"
    })

    let DivZView = klass(ZView, {
        constructor: function(){
            ZView.apply(this, arguments)

            if ( this.model.getItem("id") )
              this.root.setAttribute("id", this.model.getItem("id") )
        }
      , _template: "div"
    })

    let CSSZView = klass(ZView, {
        constructor: function(){
            ZView.apply(this, arguments)

            if ( this.model.getItem("href") )
              this.root.setAttribute("href", this.model.getItem("href") )
        }
      , _template: "link[rel=stylesheet]"
    })

    let ScriptZView = klass(ZView, {
        constructor: function(){
            ZView.apply(this, arguments)

            if ( this.model.getItem("src") )
              this.root.setAttribute("src", this.model.getItem("src") )
            if ( this.model.getItem("text") )
              this.root.textContent = this.model.getItem("text")
        }
      , _template: "script"
    })

    let changetimer //a timer to prevent spam change event
    function onchange(){
        if ( server )
          server.purge()
        server = new Server({
            "*": function(route, next){
                console.log(route.path)
                return next(false)
            }
          , "catchall": function(route){
                let buffer = new Buffer("404")
                route.response.writeHead(404, {
                    "Content-Type": "text/plain"
                  , "Content-Length": buffer.length
                })
                route.response.end(buffer)
            }
        })
        server.listen(9876)
        console.log("server: (re)started and listening on port 9876")

        //bundle the main project

        function onerr(err){
            server.addRouteHandler("*", function(route, next){
                let buffer = new Buffer(err.message)

                route.response.writeHead(404, {
                    "Content-Type": "text/plain"
                  , "Content-Length": buffer.length
                })
                route.response.end(buffer)

                return next(true)
            })
            console.log(err.message)
        }

        browserify("./src/dom/index.js").bundle(function(err, buffer){
            let korbut = buffer

            if ( err ) return onerr(err)
            server.addRouteHandler({
                "/GET/": function(){
                      let buffer = new Buffer(`<!doctype html>` + new ZView("script[src=$src]", { "src": "./korbut.js" }).root.outerHTML )
                      return function(route, next){
                          route.response.writeHead(200,{
                              "Content-Type": "text/html"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      }
                  }()
                , "/GET/korbut.js": function(route, next){
                        route.response.writeHead(200, {
                            "Content-Type": "application/javascript"
                          , "Content-Length": korbut.length
                        })
                        route.response.end(korbut)
                  }
                , "/GET/specs/css/:file": function(route, next){
                      new Promise(function(resolve, reject){
                          let file = (route.matches.file||"").match("^mocha") ? "./node_modules/mocha/mocha.css"
                                    : "./specs/css/" + route.matches.file

                          fs.readFile(file, function(err, buffer){
                              if ( err )
                                reject(err)
                              resolve(buffer)
                          })
                      }).then(function(buffer){
                          route.response.writeHead(200, {
                              "Content-Type": "text/css"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      }, function(e){
                          let buffer = new Buffer(e.message)
                          route.response.writeHead(404, {
                              "Content-Type": "text/plain"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      })
                  }
                , "/GET/specs/js/:file": function(route, next){
                      new Promise(function(resolve, reject){
                          let file = (route.matches.file||"").match("^mocha") ? "./node_modules/mocha/mocha.js"
                                   : (route.matches.file||"").match("^chai") ? "./node_modules/chai/chai.js"
                                   : "./specs/js/"+route.matches.file

                          fs.readFile(file, function(err, buffer){
                              if ( err )
                                reject(err)
                              resolve(buffer)
                          })
                      })
                      .then(function(buffer){
                          route.response.writeHead(200, {
                              "Content-Type": "application/javascript"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      }, function(e){
                          let buffer = new Buffer(e.message)
                          route.response.writeHead(404, {
                              "Content-Type": "text/plain"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      })
                  }
                , "/GET/specs/:specs": function(route, next){
                      new Promise(function(resolve, reject){
                          let scripts = [{src: "/specs/js/mocha.js"}, { text: `mocha.setup('bdd')` }, {src: "/specs/js/chai.js"}, {src: "/korbut.js"}, { text: `mocha.run()` }]
                          let divs = [{ id: "tests" }, { id: "mocha" }]
                          let css = [{href:"/specs/css/mocha.css"}]

                          function res(){
                              let pageZView = new PageZView({ divs: divs, scripts: scripts, css: css })
                              resolve(new Buffer(`<!doctype html>${pageZView.root.outerHTML}`))
                          }
                          if ( route.matches.specs.match("^index") || !route.matches.specs.length )
                            fs.readdir("./specs/js/", function(err, files){
                                if ( err )
                                  reject(err)

                                while ( files.length )
                                  void function(file){
                                      if ( file.match("\.js$"))
                                        scripts.splice(-1, 0, {src: `/specs/js/${file}`})
                                  }( files.shift() )
                                res()
                            })
                          else void function(specs){
                              let iterator = new Iterator(specs)

                              while ( !iterator.next().done ) {
                                let file = iterator.current.value.match("\.js$") ? iterator.current.value : `${iterator.current.value}.js`
                                scripts.splice(-1, 0, {src: `/specs/js/${file}`})
                              }

                              res()
                          }( (route.matches.specs||"").split(",") )
                      }).then(function(buffer){
                          route.response.writeHead(200, {
                              "Content-Type": "text/html"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      }, function(err){
                          let buffer = new Buffer(e.message)
                          route.response.writeHead(404, {
                              "Content-Type": "text/plain"
                            , "Content-Length": buffer.length
                          })
                          route.response.end(buffer)
                      })
                  }
            })
        })
    }

    watcher.addEventListener("change", function(){
        clearTimeout(changetimer)
        changetimer = setTimeout(onchange, 200)
    })
    onchange()
}()

void function thisfilewatcher(){
    let watcher = new Watcher("./app.js")
    let i = 0
    watcher.addEventListener("change", function(e){
      console.log("change on app.js", ++i)
    })
}()
