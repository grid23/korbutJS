"use strict"

var _ = require("./utils")
var klass = require("./class").class
var UID = require("./UID").UID
var Iterator = require("./Iterator").Iterator
var Stylesheet = require("./Stylesheet").Stylesheet
var CSSRule = require("./Stylesheet").CSSRule
var domReady = require("./domReady")
var requestAnimationFrame = require("./dom-utils/requestAnimationFrame").requestAnimationFrame
var Promise = require("./Promise").Promise
var cssProperties = window.getComputedStyle(document.createElement("div"))

module.exports.CSSHook = klass(function(statics){
    var hooks = Object.create(null)

    Object.defineProperties(statics, {
        testProperty: { enumerable: true,
            value: function(property, value){
                return hooks[property] ? hooks[property].instance.test(value) : {
                    property: property
                  , value: value
                  , originalProperty: property
                }
            }
        }
      , getByProperty: { enumerable: true,
            value: function(property){
                return hooks[property].instance
            }
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return hooks[uid].intance
            }
        }
    })

    return {
        constructor: function(property, handler, args){
            args = _.spread(arguments)
            handler = _.typeof(args[args.length-1]) == "function" ? args.pop() : function(property, value){ return { property: property, value: value } }
            property = _.typeof(args[args.length-1]) == "string" ? args.pop() : Object.prototype.toString.call(args.pop())

            hooks[this.uid] = hooks[property] = Object.create(null, {
                instance: { value: this }
              , property: { value: property }
              , handler: { value: handler }
            })
        }
      , test: { enumerable: true,
            value: function(value, hooked){
                value = _.typeof(value) == "string" ? value : Object.prototype.toString.call(value)

                hooked = hooks[this.uid].handler(value)
                hooked = _.typeof(hooked) == "object" && hooked.hasOwnProperty("value") ? hooked
                       : _.typeof(hooked) == "string" ? { value: hooked }
                       : { value: value }
                hooked.property = hooked.property || this.property
                hooked.originalProperty = hooked.originalProperty || this.property

                return hooked
            }
        }

      , property: { enumerable: true,
            get: function(){
                return hooks[this.uid].property
            }
        }
      , handler: { enumerable: true,
            get: function(){
                return hooks[this.uid].handler
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete hooks[this.uid].instance
            }
        }
    }
})

new module.exports.CSSHook("transform", function(prop, div){
    div = document.createElement("div")
    div.style.cssText = "-ms-transform:scale(1,1)"

    if ( div.style.cssText.length )
      return function(value){
          return { property: "-ms-transform", value: value }
      }
    else if ( cssProperties.getPropertyValue("transform") != void 0 )
      return function(value){
          return { property: "transform", value: value }
      }
    else
      return function(value){
          return { property: "-webkit-transform", value: value }
      }
}())

module.exports.Transition = klass(function(statics){
    var transitions = Object.create(null)
    var CSS_TRANSITION_COMPAT = "TransitionEvent" in window ? 1 : "WebKitTransitionEvent" in window ? 3 : 0

    Object.defineProperties(statics, {
        NONE: { enumerable: true, value: 0 }
      , STANDARD: { enumerable: true, value: 1 }
      , WEBKIT: { enumerable: true, value: 3 }
      , CSS_TRANSITION_COMPAT: { enumerable: true,
            value: CSS_TRANSITION_COMPAT
        }
      , CSS_TRANSITION_PROPERTY: { enumerable: true,
            value: "TransitionEvent" in window ? "transition" : "WebKitTransitionEvent" in window ? "-webkit-transition" : null
        }
      , CSS_TRANSITIONEND_EVENT: { enumerable: true,
            value: "TransitionEvent" in window ? "transitionend" : "WebKitTransitionEvent" in window ? "webkitTransitionEnd" : null
        }
      , stylesheet: { enumerable: true,
            value: new Stylesheet({ uid: "korbut-transFX" })
        }
      , CUSTOM_DATA: { enumerable: true,
            value: "data-k-transFX-ID"
        }
      , CLASSLIST_COMPAT: { enumerable: true,
            value: Element.prototype.hasOwnProperty("classList")
        }
      , animate: { enumerable: true,
            value: function(nodes, properties, callback, all, output, args, iterator, propsDict, propsTo){
                args = _.spread(arguments)
                callback =  _.typeof(args[args.length-1]) == "function" ? args.pop() : Function.prototype
                properties = _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
                nodes = args.length == 1 && args[0] && args[0].nodeType === Node.ELEMENT_NODE ? [args.pop()]
                     : args.length == 1 && Iterator.isIterable(args[0]) ? args.pop()
                     : args.length > 1 ? args
                     : []
                all = []

                propsDict = {}
                propsTo = {}

                iterator = new Iterator(properties)
                while ( !iterator.next().done )
                  void function(property, value){
                      propsDict[property] = value.transition || ""
                      propsTo[property] = value.to || ""
                  }(iterator.current.key, iterator.current.value)

                iterator = new Iterator(nodes)

                while ( !iterator.next().done  )
                  void function(node){
                      if ( !node || node.nodeType !== Node.ELEMENT_NODE )
                        return

                      all.push(new module.exports.Transition(node, propsDict).animate(propsTo))
                  }(iterator.current.value)

                output = Promise.all(all)

                output.then(function(){
                    callback(null)
                }, function(err){
                    callback(err, null)
                })

                return output
            }
        }
    })

    function createCSSRule(selectorText, properties, propsToAnimate, iterator, cssText){
        iterator = new Iterator(properties)
        propsToAnimate = []
        cssText = []

        while( !iterator.next().done )
          void function(key, value, hooked){
              hooked = module.exports.CSSHook.testProperty(key, value)

              if ( !cssProperties.getPropertyValue(hooked.property) === void 0 )
                return

              if ( _.typeof(value) == "number" )
                cssText.push( [hooked.property, " ", value, "s"].join("") )
              else if ( _.typeof(value) == "string" )
                cssText.push( [hooked.property, " ", value].join("") )
              else
                cssText.push( [hooked.property, " ", "0s"].join("") )

              propsToAnimate.push(hooked.property)
          }( iterator.current.key, iterator.current.value )

        return {
            propsToAnimate: propsToAnimate
          , classname: selectorText
          , cssRule: new CSSRule("."+selectorText, module.exports.Transition.CSS_TRANSITION_PROPERTY+ ": " + cssText.join(", "))
        }
    }

    return {
        constructor: function(node, properties, args, created, exists){
            args = _.spread(arguments)
            properties = _.typeof(args[args.length-1]) == "object" ? args.pop() : {}
            node = args[args.length-1] && args[args.length-1].nodeType == Node.ELEMENT_NODE ? args.pop() : document.createElement("div")

            if ( _.typeof(properties.classname) == "string" )
              exists = true,
              created = {
                  propsToAnimate: _.typeof(properties.properties) == "array" ? properties.properties : []
                , classname: properties.classname
                , cssRule: null
              }
            else
              created = createCSSRule(this.uid, properties)

            transitions[this.uid] = Object.create(null, {
                instance: { value: this }
              , node: { value: node }
              , properties: { value: created.propsToAnimate }
              , classname: { value: created.classname }
              , cssRule: { value: created.cssRule }
            })

            if ( !exists )
              this.stylesheet.insertRule(transitions[this.uid].cssRule)
        }

      , animate: { enumerable: true,
            value: function(){
                if ( CSS_TRANSITION_COMPAT )
                  return function(propsToIte, callback, oargs, args, propsTo, propsAnimating, animationId, self, alreadyEnabled, error){
                      self = this
                      oargs = arguments
                      args = _.spread(arguments)
                      callback = _.typeof(args[args.length-1]) == "function" ? args.pop() : Function.prototype
                      propsTo = []
                      propsAnimating = []
                      propsToIte = new Iterator( _.typeof(args[args.length-1]) == "object" ? args.pop() : {} )
                      animationId = UID.uid()
                      alreadyEnabled = !!this.enabled

                      return new Promise(function(resolve, reject){
                          domReady.then(function(d, body){
                              body = d.nodes.body

                              function end(){
                                  return function(){
                                      this.node.removeEventListener(this.CSS_TRANSITIONEND_EVENT, ontransitionend, true)

                                      if ( this.node.getAttribute(this.CUSTOM_DATA) === animationId && !error ) {
                                          this.node.removeAttribute(this.CUSTOM_DATA)
                                          callback(null)
                                          resolve(null)
                                      } else {
                                          callback(error||true)
                                          resolve(error||true) //tmp
                                      }

                                      if ( !alreadyEnabled )
                                        this.disable()
                                  }.call(self)
                              }

                              function ontransitionend(e, idx){
                                  return function(){
                                      if ( e.target !== this.node )
                                        return

                                      if ( idx = propsAnimating.indexOf(e.propertyName), idx != -1 )
                                        propsAnimating.splice(idx, 1)

                                      if ( !propsAnimating.length || this.node.getAttribute(this.CUSTOM_DATA) !== animationId )
                                        end()
                                  }.call(self)
                              }

                              try {
                                  if ( !body.contains(this.node) )
                                    throw new Error("node out of DOM")

                                  while ( !propsToIte.next().done )
                                    void function(hooked, clone, computedStyles, cloneComputedStyles, curr, next){
                                        computedStyles = getComputedStyle(this.node)

                                        clone.style.setProperty("transition", "")
                                        clone.style.setProperty(hooked.property, hooked.value)

                                        curr = computedStyles.getPropertyValue(hooked.property)
                                        curr = curr !== "auto" ? curr : "0px"

                                        this.node.parentNode.insertBefore(clone, this.node)
                                        cloneComputedStyles = getComputedStyle(clone)
                                        next = cloneComputedStyles.getPropertyValue(hooked.property)
                                        clone.parentNode.removeChild(clone)

                                        if ( curr !== next || hooked.force ) {
                                          propsTo.push([hooked.property, next]),
                                          this.node.style.setProperty(hooked.property, curr)

                                          if ( this.properties.indexOf(hooked.property) != -1 )
                                            propsAnimating.push(hooked.property)
                                        }
                                    }.call(this, module.exports.CSSHook.testProperty(propsToIte.current.key, propsToIte.current.value), this.node.cloneNode(true))
                              } catch(e){
                                  error = e
                                  return end()
                              }

                              requestAnimationFrame(function(){
                                  this.node.setAttribute(this.CUSTOM_DATA, animationId)

                                  if ( !alreadyEnabled )
                                    this.enable()

                                  this.node.addEventListener(this.CSS_TRANSITIONEND_EVENT, ontransitionend, true)

                                  requestAnimationFrame(function(){
                                      while ( propsTo.length )
                                        this.node.style.setProperty(propsTo[0][0], propsTo.shift()[1])

                                      if ( !propsAnimating.length )
                                        end()
                                  }.bind(this))
                              }.bind(this))
                          }.bind(this))
                      }.bind(this))
                  }
                else
                  return function(args, callback, propsToIte){
                      args = _.spread(arguments)
                      callback = _.typeof(args[args.length-1]) == "function" ? args.pop() : Function.prototype
                      propsToIte = new Iterator( _.typeof(args[args.length-1]) == "object" ? args.pop() : {} )

                      return new Promise(function(resolve, reject, error){
                          domReady.then(function(d, body){
                              body = d.nodes.body

                              function end(){
                                  if ( error )
                                    callback(error),
                                    reject(error)
                                  else
                                    callback(null),
                                    resolve(null)
                              }

                              requestAnimationFrame(function(){
                                  try {
                                      if ( !body.contains(this.node) )
                                        throw new Error("node out of DOM")

                                      while ( !propsToIte.next().done )
                                        void function(hooked){
                                            this.node.style[hooked.property] = hooked.value
                                        }.call(this, module.exports.CSSHook.testProperty(propsToIte.current.key, propsToIte.current.value))
                                  } catch(e){
                                      error = e
                                      return end()
                                  }
                              }.bind(this))
                          }.bind(this))
                      }.bind(this))
                  }
            }()

        }

      , enabled: { enumerable: true,
            get: function(){
                if ( this.CLASSLIST_COMPAT )
                  return this.node.classList.contains(transitions[this.uid].classname)
                else
                  return this.node.className.indexOf(transitions[this.uid].classname) > -1
            }
        }

      , enable: { enumerable: true,
            value: function(){
                if ( this.CLASSLIST_COMPAT )
                  this.node.classList.add(transitions[this.uid].classname)
                else
                  this.node.className += " "+transitions[this.uid].classname
            }
        }
      , disable: { enumerable: true,
            value: function(){
                if ( this.CLASSLIST_COMPAT )
                  this.node.classList.remove(transitions[this.uid].classname)
                else
                  this.node.className = this.node.className.replace(" "+transitions[this.uid].classname, "")
            }
        }

      , cssRule: { enumerable: true,
            get: function(){
                return transitions[this.uid].cssRule
            }
        }
      , classname: { enumerable: true,
            get: function(){
                return transitions[this.uid].classname
            }
        }
      , node: { enumerable: true,
            get: function(){
                return transitions[this.uid].node
            }
        }
      , properties: { enumerable: true,
            get: function(){
                return transitions[this.uid].properties
            }
        }

      , CSS_TRANSITION_COMPAT: { enumerable: true,
            get: function(){ return module.exports.Transition.CSS_TRANSITION_COMPAT }
        }
      , CSS_TRANSITION_PROPERTY: { enumerable: true,
            get: function(){ return module.exports.Transition.CSS_TRANSITION_PROPERTY }
        }
      , CSS_TRANSITIONEND_EVENT: { enumerable: true,
            get: function(){ return module.exports.Transition.CSS_TRANSITIONEND_EVENT }
        }
      , CUSTOM_DATA: { enumerable: true,
            get: function(){ return module.exports.Transition.CUSTOM_DATA }
        }
      , CLASSLIST_COMPAT: { enumerable: true,
            get: function(){ return module.exports.Transition.CLASSLIST_COMPAT }
        }
      , stylesheet: { enumerable: true,
            get: function(){ return module.exports.Transition.stylesheet }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }
      , purge: { enumerable: true, configurable: true,
            value: function(){
                delete transitions[this.uid].instance
            }
        }

    }
})
