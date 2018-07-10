describe("korbut.Model", function(){

    describe("| instantiation", function(){

        it("should return a valid korbut.Model instance", function(){
            chai.expect(korbut.Model.isImplementedBy(new korbut.Model)).to.be.true
        })

        it("should accept an object as base key->value pairs", function(){
            var m = new korbut.Model({foo:"bar", bar:"foo"})

            chai.expect(m.data.foo).to.be.equal("bar")
            chai.expect(m.data.bar).to.be.equal("foo")
            chai.expect(m.data.bar).to.be.equal("foo")
            chai.expect(m.getItem("bar")).to.be.equal("foo")
        })

        it("should accept a serialized string as base key->value pairs", function(){
            var m = new korbut.Model("foo=bar&bar=foo")

            chai.expect(m.data.foo).to.be.equal("bar")
            chai.expect(m.getItem("foo")).to.be.equal("bar")
            chai.expect(m.data.bar).to.be.equal("foo")
            chai.expect(m.getItem("bar")).to.be.equal("foo")
        })
    })

    describe("#setItem", function(){
        var m = new korbut.Model
        window.m = m

        it("should accept any JSON-compatible type of data", function(){
              m.setItem("a", 0)
              chai.expect(m.data.a).to.be.equal(0)
              chai.expect(m.getItem("a")).to.be.equal(0)

              m.setItem("b", 1)
              chai.expect(m.data.b).to.be.equal(1)
              chai.expect(m.getItem("b")).to.be.equal(1)

              m.setItem("c", -1)
              chai.expect(m.data.c).to.be.equal(-1)
              chai.expect(m.getItem("c")).to.be.equal(-1)

              m.setItem("z", new Number(2))
              chai.expect(m.data.z).to.be.equal(2)
              chai.expect(m.getItem("z")).to.be.equal(2)

              m.setItem("e", true)
              chai.expect(m.data.e).to.be.true
              chai.expect(m.getItem("e")).to.be.true

              m.setItem("f", false)
              chai.expect(m.data.f).to.be.false
              chai.expect(m.getItem("f")).to.be.false

              m.setItem("g", new Boolean(1))
              chai.expect(m.data.g).to.be.true
              chai.expect(m.getItem("g")).to.true

              m.setItem("h", "string")
              chai.expect(m.data.h).to.be.equal("string")
              chai.expect(m.getItem("h")).to.be.equal("string")

              m.setItem("i", new String("string"))
              chai.expect(m.data.i).to.be.equal("string")
              chai.expect(m.getItem("i")).to.be.equal("string")

              m.setItem("j", { k: [{l: "string", m: "string"}, { o: "string" }], p: "string"})

              chai.expect(m.data["j.k.0.l"]).to.be.equal("string")
              chai.expect(m.getItem("j.k.0.l")).to.be.equal("string")

              m.setItem("q", [0])
              chai.expect(m.data["q.length"]).to.be.equal(1)
              chai.expect(m.getItem("q.0")).to.be.equal(0)

              m.setItem("r", new Array(2))
              chai.expect(m.data["r.length"]).to.be.equal(2)
              chai.expect(m.getItem("r.0")).to.be.undefined
        })
    })

    describe("0, null, false, undefined values in dataset", function(){
        it ("0 should never equal false", function(done){
            var m = new korrbut.Model

            m.addEventListener("add", function onadd(e){
                m.removeEventListener("add", onadd)

                chai.expect(e.from).to.be.undefined
                chai.expect(e.to).to.be.equal(0)

                m.addEventListener("add", function onadd(e){
                    console.log(e.from, e.to)
                    chai.expect(e.from).to.be.equal(0)
                    chai.expect(e.to).to.be.equal(25)
                    done()
                })
                m.setItem("x", 25)
            })
            m.setItem("x", 0)
        })
    })

})
