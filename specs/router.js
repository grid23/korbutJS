describe("korbut.Route", function(){

    describe("| instantiation", function(){
        var a = new korbut.Route("foo")
        var b = new korbut.Route("/foo", { detail: { bar:  "bar" } })
        var c = new korbut.Route("foo", "foo", "bar")
        var d = new korbut.Route("foo", 1)

        it("should return a korbut.Route instance", function(){
            chai.expect(korbut.Route.isImplementedBy(a)).to.be.true
            chai.expect(korbut.Route.isImplementedBy(b)).to.be.true
            chai.expect(korbut.Route.isImplementedBy(c)).to.be.true
        })

        it("should define type and detail properties a valid way", function(){
            chai.expect(a.path).to.be.equal("foo")
            chai.expect(b.path).to.be.equal("/foo")
            chai.expect(a.detail).to.be.null
            chai.expect(b.detail.bar).to.be.equal("bar")
            chai.expect(c.detail).to.be.eql(["foo", "bar"])
            chai.expect(d.detail).to.be.equal(1)
        })
    })

    describe("| extending", function(){
        var A = korbut.Route.extend({
                constructor: function(type, request, response){
                    korbut.Route.call(this, type)

                    this.request = request
                    this.response = response
                }
              , request: { enumerable: true,
                    get: function(){
                        return this._request
                    }
                  , set: function(v){
                          this._request = v
                    }
                }
              , response: { enumerable: true,
                    get: function(){
                        return this._response
                    }
                  , set: function(v){
                          this._response = v
                    }
                }
            })
        function request(){}
        function response(){}
        var a = new A("/foo", request, response)

        it ("should work... :)", function(){
            chai.expect(a.path).to.be.equal("/foo")
            chai.expect(a.request).to.be.a("function")
            chai.expect(a.response).to.be.a("function")
            chai.expect(a.request).to.be.equal(request)
            chai.expect(a.response).to.be.equal(response)
        })
    })

})

describe("korbut.Router", function(){
    var a = new korbut.Router
    var b = new korbut.Router
    var uid = b.uid

    describe("| instantiation", function(){
        it("should return a valid korbut.Router instance", function(){
            chai.expect(korbut.Router.isImplementedBy(a)).to.be.true
            chai.expect(korbut.Router.isImplementedBy(b)).to.be.true
        })
    })

    describe("#isRouteHandler()", function(){
        it("should return true|false whether the passed argument is a valid route handler", function(){
            chai.expect(korbut.Router.isRouteHandler(function(){})).to.be.true
            chai.expect(korbut.Router.isRouteHandler({ handleRoute: function(){} })).to.be.true
            chai.expect(korbut.Router.isRouteHandler({ handler: function(){} })).to.be.false
            chai.expect(korbut.Router.isRouteHandler(null)).to.be.false
            chai.expect(korbut.Router.isRouteHandler("foo")).to.be.false
            chai.expect(korbut.Router.isRouteHandler({})).to.be.false
        })
    })

    describe("#getByUid()", function(){
        it("should return a router object corresponding to the passed uid", function(){
            chai.expect(korbut.Router.getByUid(uid)).to.be.equal(b)
        })
    })

    describe("->addRouteHandler", function(){
        var a = new korbut.Router
        function onfoo(){}
        function onbar(){}

        describe("(path, handler)", function(){

            it ("should return the number of registered handlers", function(){
                chai.expect(a.addRouteHandler("*")).to.be.equal(0)
                chai.expect(a.addRouteHandler("/foo", onfoo)).to.be.equal(1)
            })

            it ("should create the path as a key in router.routes", function(){
                chai.expect(Object.prototype.hasOwnProperty.call(a.routes, "/foo")).to.be.true
            })

            it ("should set that key value as a single function when it's the first handler", function(){
                chai.expect(a.routes["/foo"]).to.be.a("function")
                chai.expect(a.routes["/foo"]).to.be.equal(onfoo)
            })

            it("should set that key as a an array of handlers, when more handlers are added", function(){
                a.addRouteHandler("/foo", function(){})
                chai.expect(a.routes["/foo"]).to.be.a("array")
            })

        })

        describe("(handlerDict)", function(){
            it ("should return the number of registered handlers", function(){
                chai.expect(a.addRouteHandler({ "/fu": function(){}, "/biz": function(){} })).to.be.equal(2)
            })
        })

        describe("(path, handlerObject)", function(){
            it ("should return the number of registered handler", function(){
                chai.expect(a.addRouteHandler("/biz")).to.be.equal(0)
                chai.expect(a.addRouteHandler("/biz", { handleRoute: function(){} })).to.be.equal(1)
            })
        })

    })

    describe("=>removeRouteHandler", function(){
        it("todo", function(){
            throw Error
        })
    })

    describe("=>dispatchRoute", function(){
        var a = new korbut.Router
        var b = new korbut.Router

        var foofired, barfired
        var foo2fired, bar2fired = false
        var simplenextfired = 0
        var fooyield, baryield
        var byield

        function onfoo(route, next){
            foofired = true
            return next()
        }

        function onfoo2(route, next){
            foo2fired = true
            return "foo2"
        }

        function onbar(route, next){
            barfired = true
            return "bar"
        }

        function onbar2(route, next){
            return next()
        }

        function simpleNext(route, next){
            simplenextfired++
            next()
        }

        a.addRouteHandler({
            "/foo": onfoo
          , "/bar": onbar
        })

        b.addRouteHandler("*", simpleNext)
        b.addRouteHandler("*", simpleNext)
        b.addRouteHandler("*", simpleNext)
        b.addRouteHandler("whatever", simpleNext)
        b.addRouteHandler("whatever", simpleNext)
        b.addRouteHandler("whatever", simpleNext)

        a.addRouteHandler("/foo", onfoo2)

        fooyield = a.dispatchRoute("/foo")
        baryield = a.dispatchRoute("/bar")
        byield = b.dispatchRoute("whatever")

        it("should work as expected with return values", function(){
            chai.expect(foofired).to.be.true
            chai.expect(foo2fired).to.be.true
            chai.expect(barfired).to.be.true
            chai.expect(fooyield).to.be.equal("foo2")
            chai.expect(baryield).to.be.equal("bar")
            chai.expect(simplenextfired).to.be.equal(6)
            chai.expect(byield).to.be.equal(3) //"*" don't count
        })

        it("should work as expected with the route argument", function(){
            var a = new korbut.Router

            a.addRouteHandler("/foo", function(route, next){
                return [route.path, typeof route.timestamp]
            })

            chai.expect(a.dispatchRoute("/foo")).to.be.eql(["/foo", "number"])
        })

        it("should work as expected with matches", function(){
            var a = new korbut.Router

            a.addRouteHandler("/foo/:bar", function(route, next){
                return route.matches.bar
            })

            a.addRouteHandler("/bar/:foo/:biz", function(route, next){
                return [ route.matches.foo, route.matches.biz ]
            })

            chai.expect(a.dispatchRoute("/foo/stuff")).to.be.equal("stuff")
            chai.expect(a.dispatchRoute("/bar/abc/def")).to.be.eql(["abc", "def"])
        })

    })

})
