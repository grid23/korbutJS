describe("korbut.Model", function(){

    describe("| instantiation", function(){

        it("should return a valid korbut.Model instance", function(){
            chai.expect(korbut.Model.isImplementedBy(new korbut.Model)).to.be.true
        })

        it("should accept an object as base key->value pairs", function(){
            var m = new korbut.Model({foo:"bar", bar:"foo"})

            chai.expect(m.data.foo).to.be.equal("bar")
            chai.expect(m.data.bar).to.be.equal("foo")
        })

        it("should accept a serialized string as base key->value pairs", function(){
            var m = new korbut.Model("foo=bar&bar=foo")

            chai.expect(m.data.foo).to.be.equal("bar")
            chai.expect(m.data.bar).to.be.equal("foo")
        })

    })

})
