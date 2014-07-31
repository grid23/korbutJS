describe("korbut.Event", function(){
    describe("| instantiation", function(){
        var a = new korbut.Event("foo")
        var b = new korbut.Event("foo", { detail: { bar: "bar" }})
        var c = new korbut.Event("foo", "foo", "bar")

        it("should return a korbut.Event instance", function(){
            chai.expect(korbut.Event.isImplementedBy(a)).to.be.true
            chai.expect(korbut.Event.isImplementedBy(b)).to.be.true
        })

        it("should define type and detail properties a valid way", function(){
            chai.expect(a.type).to.be.equal("foo")
            chai.expect(b.type).to.be.equal("foo")
            chai.expect(a.detail).to.be.null
            chai.expect(b.detail.bar).to.be.equal("bar")
        })
    })
})

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
            chai.expect(korbut.EventTarget.isEventListener({ handler: function(){} })).to.be.false
            chai.expect(korbut.EventTarget.isEventListener(null)).to.be.false
            chai.expect(korbut.EventTarget.isEventListener("foo")).to.be.false
            chai.expect(korbut.EventTarget.isEventListener({})).to.be.false
        })
    })

    describe("#getByUid()", function(){
        it("should return a eventTarget object corresponding to the passed uid", function(){
            chai.expect(korbut.EventTarget.isImplementedBy( korbut.EventTarget.getByUid(uid) )).to.be.true
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

            it("should set that key value as a single function when its the first handler", function(){
                chai.expect(a.events.foo).to.be.a("function")
                chai.expect(a.events.foo).to.be.equal(onfoo)
            })

            it("should set that key to an array of handlers, when more handlers are added", function(){
                a.addEventListener("foo", function(){ })
                chai.expect(a.events.foo).to.be.a("array")
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
                chai.expect(a.events.bar).to.be.equal(onbar)
            })

            it("should set that key to an array of handlers, when more handlers are added", function(){
                a.addEventListener("bar", function(){ })
                chai.expect(a.events.foo).to.be.a("array")
            })
        })
    })

    describe("->removeEventListener", function(){
        var a = new korbut.EventTarget
        a

        describe("(eventType, handler)", function(){

        })

        describe("(eventType, handler)", function(){

        })
    })

    describe("::events", function(){

    })

    describe("->dispatchEvent", function(){
        describe("(eventObject)", function(){

        })

        describe("(eventType, ...details)", function(){

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
