describe("korbut.Event", function(){
    describe("| instantiation", function(){
        var a = new korbut.Event("foo")
        var b = new korbut.Event("foo", { detail: { bar: "bar" }})
        var c = new korbut.Event("foo", "foo", "bar")
        var d = new korbut.Event("foo", 1)

        it("should return a korbut.Event instance", function(){
            chai.expect(korbut.Event.isImplementedBy(a)).to.be.true
            chai.expect(korbut.Event.isImplementedBy(b)).to.be.true
        })

        it("should define type and detail properties a valid way", function(){
            chai.expect(a.type).to.be.equal("foo")
            chai.expect(b.type).to.be.equal("foo")
            chai.expect(a.detail).to.be.null
            chai.expect(b.detail.bar).to.be.equal("bar")
            chai.expect(c.detail).to.be.eql(["foo", "bar"])
            chai.expect(d.detail).to.be.equal(1)
        })
    })
})
