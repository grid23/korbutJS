describe("korbut.Iterator", function(){

    describe("| instantiation", function(){

        var a = [1, 2, 3]
        var b = []

        var c = { 0:1, 1:2, 2:3, length:3 }
        var d = { foo:1, bar:2, length:3 }
        var e = Object.create({}, {
                foo: { value: "foo" }
              , length: { value: 2 }
              , bar: { enumerable: true, value: "bar" }
            })
        var f = {}

        var g = "foo"
        var h = ""
        var i = "𝌆"

        it("should work with a non-empty array", function(){
            var ite = new korbut.Iterator(a)

            chai.expect(ite.length).to.be.equal(3)
            chai.expect(ite.current.done).to.be.false
            chai.expect(ite.current.value).to.be.equal(1)
            chai.expect(ite.next().value).to.be.equal(2)
            chai.expect(ite.next().value).to.be.equal(3)
            chai.expect(ite.next().done).to.be.true
        })

        it("shoul work with a empty array", function(){
            var ite = new korbut.Iterator(b)

            chai.expect(ite.length).to.be.equal(0)
            chai.expect(ite.next().done).to.be.true
        })

        it("should work with an array-like object in the same fashion as with a native array", function(){
            var ite = new korbut.Iterator(c)

            chai.expect(ite.length).to.be.equal(3)
            chai.expect(ite.next().value).to.be.equal(1)
            chai.expect(ite.next().value).to.be.equal(2)
            chai.expect(ite.next().value).to.be.equal(3)
            chai.expect(ite.next().done).to.be.true
        })

        it("should work with an object, listing only enumerable keys", function(){
            var itea = new korbut.Iterator(d)
            var iteb = new korbut.Iterator(e)

            chai.expect(itea.length).to.be.equal(3)
            chai.expect(iteb.length).to.be.equal(1)
            chai.expect(iteb.next().key).to.be.equal("bar")
            chai.expect(iteb.current.value).to.be.equal("bar")
            chai.expect(iteb.next().done).to.be.true
            itea.next()
            itea.next()
            itea.next()
            chai.expect(itea.next().done).to.be.true
        })

        it("should work with an empty object", function(){
            var ite = new korbut.Iterator(f)

            chai.expect(ite.length).to.be.equal(0)
            chai.expect(ite.next().done).to.be.true
        })

        it("should work with a string, exploding it into an array", function(){
            var ite = new korbut.Iterator(g)

            chai.expect(ite.length).to.be.equal(3)
            chai.expect(ite.next().value).to.be.equal("f")
            chai.expect(ite.next().value).to.be.equal("o")
            chai.expect(ite.next().value).to.be.equal("o")
            chai.expect(ite.next().done).to.be.true
        })

        it("should work with an empty string", function(){
            var ite = new korbut.Iterator(h)

            chai.expect(ite.length).to.be.equal(0)
            chai.expect(ite.next().done).to.be.true
        })

        it("should work with 2 bits encoded chars", function(){
            var ite = new korbut.Iterator(i)

            chai.expect(i.length).to.be.equal(2)
            chai.expect(ite.length).to.be.equal(1)
            chai.expect(ite.next().value).to.be.equal(i)
            chai.expect(ite.next().done).to.be.true
        })

        it("should generally return an empty iterator with a wrong value", function(){
            chai.expect(new korbut.Iterator().length).to.be.equal(0)
            chai.expect(new korbut.Iterator(null).length).to.be.equal(0)
            chai.expect(new korbut.Iterator(undefined).length).to.be.equal(0)
            chai.expect(new korbut.Iterator(4).length).to.be.equal(0)
            chai.expect(new korbut.Iterator(/bar/).length).to.be.equal(0)
        })
    })

    describe("| properties", function(){
        var a = new korbut.Iterator([0,1,2])

        describe("->next()", function(){

            it("should return an object containing information on the current iteration value", function(){
                var o = a.next()

                chai.expect(o.hasOwnProperty("index")).to.be.true
                chai.expect(o.hasOwnProperty("key")).to.be.true
                chai.expect(o.hasOwnProperty("value")).to.be.true
                chai.expect(o.hasOwnProperty("done")).to.be.true
            })

            it("should accept a callback function, with arguments `done`, `key` & `value`", function(){
                a.next(function(done, key, value){
                    chai.expect(done).to.be.false
                    chai.expect(key).to.be.equal("1")
                    chai.expect(value).to.be.equal(1)
                })
            })

        })

        describe("->current", function(){
            it("should return an object with the current iteration data", function(){
                o = a.current
                chai.expect(o.index).to.be.equal(1)
                chai.expect(o.done).to.be.false
                chai.expect(o.key).to.be.equal("1")
                chai.expect(o.value).to.be.equal(1)
            })
        })

    })

    describe("| statics methods", function(){

        describe("#iterate()", function(){
            it ("should return an array of iterable keys of any value", function(){

                chai.expect( korbut.Iterator.iterate([1,2,3]) ).to.be.eql( Object.keys([1,2,3]) )
                chai.expect( korbut.Iterator.iterate([]) ).to.be.eql([])

                chai.expect( korbut.Iterator.iterate({}) ).to.be.eql([])
                chai.expect( korbut.Iterator.iterate({foo:'bar', length:3}) ).to.be.eql( ["foo", "length"] )
                chai.expect( korbut.Iterator.iterate({0:"foo", length:1}) ).to.be.eql( Object.keys(["foo"]) )
                chai.expect( korbut.Iterator.iterate(Object.create({}, {
                    foo: { value: "foo" }
                  , bar: { enumerable: true, value: "bar" }
                })) ).to.be.eql( ["bar"] )

                chai.expect( korbut.Iterator.iterate("foo") ).to.be.eql( ["f", "o", "o"] )
            })
        })

        describe("#iterable", function(){
            it("should return true|false if the passed argument is iterable", function(){

                chai.expect( korbut.Iterator.iterable([1,2,3]) ).to.be.true
                chai.expect( korbut.Iterator.iterable([]) ).to.be.true

                chai.expect( korbut.Iterator.iterable({}) ).to.be.true
                chai.expect( korbut.Iterator.iterable({foo:'bar', length:3}) ).to.be.true
                chai.expect( korbut.Iterator.iterable({0:"foo", length:1}) ).to.be.true
                chai.expect( korbut.Iterator.iterable(Object.create({}, {
                    foo: { value: "foo" }
                  , bar: { enumerable: true, value: "bar" }
                })) ).to.be.true

                chai.expect( korbut.Iterator.iterable("foo") ).to.be.true

                // as an object, it should be true, even if it won't return anything interesting
                chai.expect( korbut.Iterator.iterable(/bar/) ).to.be.true

                chai.expect( korbut.Iterator.iterable(null) ).to.be.false
                chai.expect( korbut.Iterator.iterable(undefined) ).to.be.false

            })
        })

    })

})
