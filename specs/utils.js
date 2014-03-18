describe("utils", function(){

    describe("native()", function(){
        it("should return `true` if a passed function is [native code], `false otherwise`. If it can't process passed argument, it returns `null`", function(){
            chai.expect( korbutJS.utils.native( Function.prototype.call ) ).to.be.true
            chai.expect( korbutJS.utils.native( korbutJS.utils.native ) ).to.be.false
            chai.expect( korbutJS.utils.native() ).to.be.null
        })
    })

    describe("typeof()", function(){
        it("should return the lowercase version of the second part of Object.prototype.toString called on passed argument", function(){
            chai.expect( korbutJS.utils.typeof( {} ) ).to.equal("object")
            chai.expect( korbutJS.utils.typeof( new Object ) ).to.equal("object")

            chai.expect( korbutJS.utils.typeof( [] ) ).to.equal("array")
            chai.expect( korbutJS.utils.typeof( new Array ) ).to.equal("array")

            chai.expect( korbutJS.utils.typeof( "foo" ) ).to.equal("string")
            chai.expect( korbutJS.utils.typeof( new String ) ).to.equal("string")

            chai.expect( korbutJS.utils.typeof( 1 ) ).to.equal("number")
            chai.expect( korbutJS.utils.typeof( new Number ) ).to.equal("number")

            chai.expect( korbutJS.utils.typeof( true ) ).to.equal("boolean")
            chai.expect( korbutJS.utils.typeof( new Boolean ) ).to.equal("boolean")

            void function(){
                chai.expect( korbutJS.utils.typeof( arguments ) ).to.equal("arguments")
            }()
        })
    })

    describe("object()", function(){
        it("should return true if passed argument has `Object` has a constructor, `false` otherwise", function(){
            chai.expect( korbutJS.utils.object( {} ) ).to.be.true
            chai.expect( korbutJS.utils.object( Object.create({}) ) ).to.be.true
            chai.expect( korbutJS.utils.object( { constructor: function(){} } ) ).to.be.false
            chai.expect( korbutJS.utils.object( Object.create(null) ) ).to.be.false
        })
    })

    describe("invocable()", function(){
        it("should return `true` if passed argument is either a function or has a `handleInvoke` property that is a function, `false`otherwise", function(){
            chai.expect( korbutJS.utils.invocable( function(){} ) ).to.be.true
            chai.expect( korbutJS.utils.invocable( { handleInvoke: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.invocable( {} ) ).to.be.false
            chai.expect( korbutJS.utils.invocable( null ) ).to.be.false
        })
    })

    describe("eventable()", function(){
        it("should return `true` if passed argument is invocable or has a property `handleEvent` that is invocable, `false` otherwhise", function(){
            chai.expect( korbutJS.utils.eventable(function(){}) ).to.be.true
            chai.expect( korbutJS.utils.eventable( { handleInvoke: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.eventable( { handleEvent: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.eventable( { handleEvent: { handleInvoke: function(){} } } ) ).to.be.true
            chai.expect( korbutJS.utils.eventable( {} ) ).to.be.false
            chai.expect( korbutJS.utils.eventable( null ) ).to.be.false
        })
    })

    describe("routable()", function(){
        it("should return `true` if passed argument is invocable or has a property `handleRoute` that is invocable, `false` otherwhise", function(){
            chai.expect( korbutJS.utils.routable(function(){}) ).to.be.true
            chai.expect( korbutJS.utils.routable( { handleInvoke: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.routable( { handleRoute: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.routable( { handleRoute: { handleInvoke: function(){} } } ) ).to.be.true
            chai.expect( korbutJS.utils.routable( {} ) ).to.be.false
            chai.expect( korbutJS.utils.routable( null ) ).to.be.false
        })
    })

    describe("thenable()", function(){
        it("should return `true` if passed argument is invocable or has either or both a `handleResolve` and/or `handleReject` property that is invocable, `false` otherwhise", function(){
            chai.expect( korbutJS.utils.thenable(function(){}) ).to.be.true
            chai.expect( korbutJS.utils.thenable( { handleInvoke: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.thenable( { handleResolve: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.thenable( { handleResolve: { handleInvoke: function(){} } } ) ).to.be.true
            chai.expect( korbutJS.utils.thenable( { handleReject: function(){} } ) ).to.be.true
            chai.expect( korbutJS.utils.thenable( { handleReject: { handleInvoke: function(){} } } ) ).to.be.true
            chai.expect( korbutJS.utils.thenable( {} ) ).to.be.false
            chai.expect( korbutJS.utils.thenable( null ) ).to.be.false
        })
    })

    describe("spread()", function(){
        it("should behave like slice on any pseudo-array or array passed as argument", function(){
            chai.expect( korbutJS.utils.spread([0, 1, 2], 2) ).to.deep.equal([2])
            chai.expect ( korbutJS.utils.spread( { 0:4, 1:5, 2:6, length:3 } ) ).to.deep.equal([4, 5, 6])
            void function(){
                chai.expect( korbutJS.utils.spread(arguments , 1) ).to.deep.equal([1, 2])
            }(0, 1, 2)
        })
    })

    describe("enumerate()", function(){
        it("should act like Object.keys on an object", function(){
            chai.expect( korbutJS.utils.enumerate([0, 1, 2]) ).to.deep.equal( Object.keys([0, 1, 2]) )
            chai.expect( korbutJS.utils.enumerate({ foo: "bar", bar: "foo" }) ).to.deep.equal( Object.keys({foo:"bar", bar: "foo"}) )
        })

        it("should iterate over characters of a string", function(){
            chai.expect( korbutJS.utils.enumerate( "foo" ) ).to.deep.equal( ["f", "o", "o"] )
            //TODO: find a 2 length char to test
        })
    })

    describe("invoke()", function(){
        it("should act like the fastest of Function.prototype.call or Function.prototype.apply depending on the situation, on a function, or on an invocable object", function(){
            // TODO: find more examples
            chai.expect( korbutJS.utils.invoke( function(a, b, c){ return [a, b, c]}, [0, 1, 2] ) ).to.deep.equal([0, 1, 2])

            void function(ctx){
                chai.expect( korbutJS.utils.invoke(ctx, ["foo"]) ).to.equal("foo")
                korbutJS.utils.invoke(function(){
                    chai.expect(this).to.equal(ctx)
                }, [], ctx)
            }( { handleInvoke: function(a){ return a } } )
        })

        it("has magic arguments capabilities", function(){
            chai.expect( korbutJS.utils.invoke( function($foo, a){ return [$foo, a] }, { $foo: "bar", 0: "foo", length: 1 } ) ).to.deep.equal(["bar", "foo"])
            chai.expect( korbutJS.utils.invoke( function(a, $foo){ return [$foo, a] }, { $foo: "bar", 0: "foo", length: 1 } ) ).to.deep.equal(["bar", "foo"])
        })
    })
})
