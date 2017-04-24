describe("korbut.EventTarget", function(){
    var a = new korbut.EventTarget
    var b = new korbut.EventTarget
    var uid = b.uid

    describe("| instantiation", function(){
        it("should return a valid korbut.EventTarget instance", function(){
            chai.expect(korbut.EventTarget.isImplementedBy(a)).to.be.true
            chai.expect(korbut.EventTarget.isImplementedBy(b)).to.be.true
        })
    })

    describe("#isEventListener()", function(){
        it("should return true|false whether the passed argument is a valid event handler", function(){
            chai.expect(korbut.EventTarget.isEventListener(function(){})).to.be.true
            chai.expect(korbut.EventTarget.isEventListener({ handleEvent: function(){} })).to.be.true
            chai.expect(korbut.EventTarget.isEventListener({ handler: function(){} })).to.be.false
            chai.expect(korbut.EventTarget.isEventListener(null)).to.be.false
            chai.expect(korbut.EventTarget.isEventListener("foo")).to.be.false
            chai.expect(korbut.EventTarget.isEventListener({})).to.be.false
        })
    })

    describe("#getByUid()", function(){
        it("should return a eventTarget object corresponding to the passed uid", function(){
            chai.expect(korbut.EventTarget.getByUid(uid)).to.be.equal(b)
        })
    })

    describe("->uid", function(){
        it("should return a valid uid", function(){
            var a = new korbut.EventTarget().uid
            var b = new korbut.EventTarget().uid
            var c
            var E = korbut.class(korbut.EventTarget, function(){
                return {
                    constructor: function(){
                        c = this.uid
                        chai.expect(c).to.not.equal(undefined)
                    }
                }
            })

            new E()
            chai.expect(a).to.not.equal(undefined)
            chai.expect(b).to.not.equal(undefined)
            chai.expect(a).to.not.equal(b)
            chai.expect(a).to.not.equal(c)
            chai.expect(b).to.not.equal(c)
        })
    })

    describe("->addEventListener", function(){
        var a = new korbut.EventTarget
        function onfoo(){}
        function onbar(){}

        describe("(eventType, handler)", function(){

            it ("should return the number of registered handler", function(){
                chai.expect(a.addEventListener("foo")).to.be.equal(0)
                chai.expect(a.addEventListener("foo", onfoo)).to.be.equal(1)
            })

            it ("should create the event type as a key in eventTarget.events", function(){
                chai.expect(Object.prototype.hasOwnProperty.call(a.events, "foo")).to.be.true
            })

            it("should set that key value as a single function when it's the first handler", function(){
                chai.expect(a.events.foo).to.be.a("function")
                chai.expect(a.events.foo).to.be.equal(onfoo)
            })

            it("should set that key to an array of handlers, when more handlers are added", function(){
                a.addEventListener("foo", function(){ })
                chai.expect(a.events.foo).to.be.a("array")
            })

        })

        describe("(handlerDict)", function(){
            it ("should return the number of registered handler", function(){
                chai.expect(a.addEventListener({fu: function(){}, biz: function(){}})).to.be.equal(2)
            })
        })

        describe("(eventType, handlerObject)", function(){

            it ("should return the number of registered handler", function(){
                chai.expect(a.addEventListener("bar")).to.be.equal(0)
                chai.expect(a.addEventListener("bar", { handleEvent: onbar })).to.be.equal(1)
            })

            it ("should create the event type as a key in eventTarget.events", function(){
                chai.expect(Object.prototype.hasOwnProperty.call(a.events, "bar")).to.be.true
            })

            it("should set that key value as a single handleEvent object when its the first handler", function(){
                chai.expect(a.events.bar).to.be.eql({ handleEvent: onbar })
                chai.expect(a.events.bar.handleEvent).to.be.equal(onbar)
            })

            it("should set that key to an array of handlers, when more handlers are added", function(){
                a.addEventListener("bar", function(){ })
                chai.expect(a.events.foo).to.be.a("array")
            })
        })
    })

    describe("->removeEventListener", function(){
        it("todo", function(){
            throw Error
        })
    })

    describe("::events", function(){
        it("todo", function(){
            throw Error
        })
    })

    describe("->dispatchEvent", function(){
        it("todo", function(){
            throw Error
        })
    })

    describe("->listeners", function(){
        describe("(...events, callback)", function(){

        })
    })

    describe("->purge", function(){
        describe("()", function(){

        })
    })
})
