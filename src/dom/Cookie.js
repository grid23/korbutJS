"use strict"

var _ = require("../utils")
var klass = require("../class").class

var Event = require("../Event").Event
var Iterator = require("../Iterator").Iterator
var Model = require("../Model").Model
var Serializer = require("../Serializer").Serializer
var UID = require("../UID").UID

module.exports.CookieSyncEvent = klass(Event, {
    constructor: function(){
        Event.call(this, "cookiesync")
    }
})

module.exports.Cookie = klass(Model, function(statics){
    var cookies = Object.create(null)
    var defaultLifespan = 15552000000
    Object.defineProperties(statics, {
        COOKIE_ENABLED: { enumerable: true,
            value: !!navigator.cookieEnabled
        }
      , getByUid: { enumerable: true,
            value: function(uid){
                return cookies[uid] && cookies[uid].instance
            }
        }
      , TOP_DOMAIN: { enumerable: true,
            value: function(split, cookiestr, i, curr, hit){
                cookiestr = "__ktestcookie=testcookie"

                function cookie(domain){
                    document.cookie = cookiestr+"; domain="+domain

                    if ( document.cookie.indexOf(cookiestr) != -1 ) {
                        document.cookie = cookiestr+"; domain="+domain+"; expires=" + new Date( +(new Date) - 1000 ).toUTCString()
                        return true
                    }

                    return false
                }

                i = split.length

                while ( i-- )
                  if ( curr = split.slice(i).join("."), hit = cookie(curr), hit )
                    return curr

                return location.hostname
            }( location.hostname.split(".") )
        }
    })

    return {
        constructor: function(dict, args, exists, data){
            args = _.spread(arguments)
            dict = _.typeof(args[0]) == "string" ? { name: args.shift() }
                 : _.typeof(args[0]) == "object" && _.typeof(args[0].name) == "string" ? args.shift()
                 : { name: "__noname" }

            Model.apply(this, args)

            cookies[this.uid] = Object.create(null, {
                instance: { value: this }
              , name: { value: dict.name }
              , session: { value: !!dict.session }
              , domain: { value: _.typeof(dict.domain) == "string" ? dict.domain : module.exports.Cookie.TOP_DOMAIN }
              , path: { value: _.typeof(dict.path) == "string" ? dict.path : "/" }
              , expires: {
                    value: !!dict.session ? ""
                         : !isNaN( +(new Date(dict.expires)) ) ? new Date(dict.expires).toUTCString()
                         : new Date( +(new Date) + (+dict.maxAge||defaultLifespan) ).toUTCString()
                }
            })

            if ( exists = document.cookie.match(cookies[this.uid].name+"=([^;]*)"), exists ) {
                try {
                    data = JSON.parse(unescape(exists[1]))
                } catch(e){
                    console.error(e)
                    data = {}
                }
                this.setItem(data)
            }

            this.addEventListener("update", function(){
                this.sync()
            }.bind(this))

            this.sync()
        }

      , sync: { enumerable: true,
            value: function(str){
                str = escape(JSON.stringify(this.raw))

                if ( str.length )
                  document.cookie = [this.name, "=", str, "; domain=", this.domain, "; path=", this.path, "; expires=", this.expires, ";"].join("")
                else
                  document.cookie = [this.name, "=0; domain=", this.domain, "; path=", this.path, "; expires=", new Date( +(new Date) - 1000 ).toUTCString(), ";"].join("")

                this.dispatchEvent(new module.exports.CookieSyncEvent)
            }
        }

      , name: { enumerable: true,
            get: function(){
                return cookies[this.uid].name
            }
        }
      , domain: { enumerable: true,
            get: function(){
                return cookies[this.uid].domain
            }
        }
      , path: { enumerable: true,
            get: function(){
                return cookies[this.uid].path
            }
        }
      , expires: { enumerable: true,
            get: function(){
                return cookies[this.uid].expires
            }
        }
      , session: { enumerable: true,
            get: function(){
                return cookies[this.uid].session
            }
        }

      , clear: { enumerable: true,
            value: function(iterator){
                iterator = new Iterator(this.data)

                while ( !iterator.next().done )
                  this.removeItem(iterator.current.key)
            }
        }

      , COOKIE_ENABLED: { enumerable: true,
            get: function(){
                return module.exports.Cookie.COOKIE_ENABLED
            }
        }
      , TOP_DOMAIN: { enumerable: true,
            get: function(){
                return module.exports.Cookie.TOP_DOMAIN
            }
        }

      , uid: { enumerable: true, configurable: true,
            get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
        }

      , purge: { enumerable: true, configurable: true,
            value: function(){
                Model.prototype.purge.call(this)
                delete cookies[this.uid]
            }
        }
    }
})
