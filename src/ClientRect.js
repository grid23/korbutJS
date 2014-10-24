"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID
var Promise = require("./Promise").Promise

module.exports.Point = klass(function(statics){
    return {
        constructor: function(x, y){
            this.x = x
            this.y = y
        }
      , _x: { writable: true,
            value: 0
        }
      , x: { enumerable: true,
            get: function(){
                return this._x
            }
          , set: function(v){
                this._x = +v === +v ? +v : 0
            }
        }
      , _y: { writable: true,
            value: 0
        }
      , y: { enumerable: true,
            get: function(){
                return this._y
            }
          , set: function(v){
                this._y = +v === +v ? +v : 0
            }
        }
      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete points[this.uid]
            }
        }
    }
})

module.exports.Matrix = klass(function(statics){
    var matrixes = Object.create(null)

    return {
        constructor: function(bcr, origin){
            matrixes[this.uid] = Object.create(null, {
                instance: { value: this }
              , bcr: { value: bcr || module.exports.ClientRect.getBoundClientRect(document.body) }
              , origin: { value: origin || new module.exports.Point(0,0) }
            })
        }

      , left: { enumerable: true,
            get: function(){
                return Math.round( matrixes[this.uid].bcr.left )
            }
        }
      , top: { enumerable: true,
            get: function(){
                return Math.round( matrixes[this.uid].bcr.top )
            }
        }
      , width: { enumerable: true,
            get: function(){
                return Math.round( matrixes[this.uid].bcr.width )
            }
        }
      , contentWidth: { enumerable: true,
            get: function(){
                return Math.round( matrixes[this.uid].bcr.contentWidth )
            }
        }
      , height: { enumerable: true,
            get: function(){
                return Math.round( matrixes[this.uid].bcr.height )
            }
        }
      , contentHeight: { enumerable: true,
            get: function(){
                return Math.round( matrixes[this.uid].bcr.contentHeight )
            }
        }
      , C: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left + matrixes[this.uid].bcr.width/2 - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top + matrixes[this.uid].bcr.height/2 - matrixes[this.uid].origin.y )
                )
            }
        }
      , NW: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top - matrixes[this.uid].origin.y )
                )
            }
        }
      , N: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left + matrixes[this.uid].bcr.width/2 - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top - matrixes[this.uid].origin.y )
                )
            }
        }
      , NE: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left + matrixes[this.uid].bcr.width - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top - matrixes[this.uid].origin.y )
                )
            }
        }
      , E: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left + matrixes[this.uid].bcr.width - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top + matrixes[this.uid].bcr.height/2 - matrixes[this.uid].origin.y )
                )
            }
        }
      , SE: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left + matrixes[this.uid].bcr.width - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top + matrixes[this.uid].bcr.height - matrixes[this.uid].origin.y )
                )
            }
        }
      , S: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left + matrixes[this.uid].bcr.width/2 - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top + matrixes[this.uid].bcr.height - matrixes[this.uid].origin.y )
                )
            }
        }
      , SW: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top + matrixes[this.uid].bcr.height - matrixes[this.uid].origin.y )
                )
            }
        }
      , W: { enumerable: true,
            get: function(){
                return new module.exports.Point(
                    Math.round( matrixes[this.uid].bcr.left - matrixes[this.uid].origin.x  )
                  , Math.round( matrixes[this.uid].bcr.top + matrixes[this.uid].bcr.height/2 - matrixes[this.uid].origin.y )
                )
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete matrixes[this.uid]
            }
        }
    }
})

module.exports.ClientRect = klass(function(statics){
    var rects = Object.create(null)

    Object.defineProperties(statics, {
        getBoundingClientRect: { enumerable: true,
            value: function(node, bcr, clientT, clientL, offsetX, offsetY){
                bcr = node.getBoundingClientRect()
                clientT = document.documentElement.clientTop || document.body.clientTop || 0
                clientL = document.documentElement.clientLeft || document.body.clientLeft || 0
                offsetX = window.pageXOffset || window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0
                offsetY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0

                return {
                    left: node === document.documentElement || node === document.body ? offsetX : bcr.left + offsetX - clientL
                  , top: node === document.documentElement || node === document.body ? offsetY : bcr.top + offsetY - clientL
                  , width: bcr.width || bcr.right - bcr.left
                  , contentWidth: node.scrollWidth
                  , height: bcr.height || bcr.bottom - bcr.top
                  , contentHeight: node.scrollHeight
                }
            }
        }
      , getEventCoordinates: { enumerable: true,
            value: function(e){
                var offsetX, offsetY

                offsetX = window.pageXOffset || window.scrollX || document.documentElement.scrollLeft || docBody.scrollLeft || 0
                offsetY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop || docBody.scrollTop || 0

                return {
                    left: (typeof e.pageX != "undefined" ? e.pageX : typeof e.clientX != "undefined" ? e.clientX + offsetX : 0)
                  , top: (typeof e.pageY != "undefined" ? e.pageY : typeof e.clientY != "undefined" ? e.clientY + offsetY : 0)
                  , width: 0
                  , contentWidth: 0
                  , height: 0
                  , contentHeight: 0
                }
            }
        }
    })

    return {
        constructor: function(dict, args){
            args = _.spread(arguments)
            dict = _.typeof(args[args.length-1]) == "object" && args[args.length-1].node && args[args.length-1].node.nodeType == Node.ELEMENT_NODE  ? args.pop()
                 : args[args.length-1] && args[args.length-1].node && args[args.length-1].node.nodeType == Node.ELEMENT_NODE ? { node: args.pop() }
                 : { node: document.documentElement }

            rects[this.uid] = Object.create(null, {
                instance: { value: this }
              , node: { value: dict.node }
              , cardinalPoint: { value: dict.cardinalPoint && module.exports.Matrix.prototype.hasOwnProperty(dict.cardinalPoint) ? dict.cardinalPoint : null }
            })

        }
      , compute: { enumerable: true,
            value: function(cb, args, refCPoint, refNode, refEvent, refOrigin){
                args = _.spread(arguments)
                cb = _.typeof(args[args.length-1]) == "function" ? args.pop() : Function.prototype

                refCPoint = args.length > 1 && _.typeof(args[args.length-1]) == "string" ? args.pop()
                          : this.cardinalPointReference

                refNode = args[args.length-1] && args[args.length-1].nodeType == Node.ELEMENT_NODE ? args.pop() : null
                refEvent = !refNode && args[args.length-1] && _.typeof(args[args.length-1].constructor) == "function" && args[args.length-1].constructor.prototype.hasOwnProperty("preventDefault") ? args.pop() : null
                refOrigin = !refNode && !refEvent && module.exports.Point.isImplementedBy(args[args.length-1]) ? args.pop()
                          : !refNode && !refEvent && args[args.length-1] && _.typeof(args[args.length-1]).x == "number" && _.typeof(args[args.length-1]).y == "number" ? args.pop()
                          : new module.exports.Point(0, 0)

                return new Promise(function(resolve, reject, ncr, rcr){
                    ncr = module.exports.ClientRect.getBoundingClientRect(this.node)

                    if ( refEvent )
                      rcr = module.exports.ClientRect.getEventCoordinates(refEvent)
                    else if ( refNode )
                      rcr = module.exports.ClientRect.getBoundingClientRect(refNode)
                    else
                      rcr = { left: refOrigin.x, top: refOrigin.y }

                    if ( !refCPoint )
                      resolve( new module.exports.Matrix(ncr, new module.exports.Point(rcr.left, rcr.top)) )
                    else
                      new module.exports.ClientRect(refNode||refEvent||docBody).compute(function(matrix){
                          resolve( new module.exports.Matrix(ncr, matrix[refCPoint].call(matrix)) )
                      })
                }.bind(this)).then(function(matrix){
                    cb(null, matrix)
                    return matrix
                }.bind(this))
            }
        }

      , node: { enumerable: true,
            get: function(){
                return rects[this.uid].node
            }
        }
      , cardinalPoint: { enumerable: true,
            get: function(){
                return rects[this.uid].cardinalPoint
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete rects[this.uid]
            }
        }
    }
})
