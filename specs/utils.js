describe("korbut.utils", function(){

    var _ = korbut.utils

    describe("#native()", function(){
        it ("should return true/false when a function is/isn't a native browser method/function", function(){
            expect(_.native(Object.hasOwnProperty)).to.be.true
            expect(_.native(function(){})).to.be.false
        })
    })

    describe("#spread()", function(){
        it ("should return an array of arguments", function(){
            void function(){
                chai.expect(_.spread(arguments)).to.be.a("array")
                chai.expect(_.spread(arguments)).to.have.length(3)
            }(1,2,3)
        })

        it("should work like Array->slice", function(){
            void function(){
                chai.expect(_.spread(arguments, 1)[0]).to.equal(2)
                chai.expect(_.spread(arguments, 1)).to.have.length(2)
                chai.expect(_.spread(arguments, 0, -1)[0]).to.equal(1)
                chai.expect(_.spread(arguments, 1, -1)).to.have.length(1)
            }(1,2,3)
        })
    })

    describe("#typeof", function(){
        it("should return function for functions and constructors", function(){
            var C = korbut.class({})
            chai.expect(_.typeof(function(){})).to.equal("function")
            chai.expect(_.typeof(C)).to.equal("function")
        })

        it("should return object for objects ({}) and instance for instances", function(){
            var C = korbut.class({})
            var c = new C
            chai.expect(_.typeof(c)).to.equal("instance")
            chai.expect(_.typeof({})).to.equal("object")
        })

        it("should return string for string primitives and String instances", function(){
            chai.expect( _.typeof( new String("foo") ) ).to.equal("string")
            chai.expect( _.typeof( "foo" ) ).to.equal("string")
        })

        it("should return number for number primitives and Number instances", function(){
            chai.expect( _.typeof( new Number("1") ) ).to.equal("number")
            chai.expect( _.typeof( 1 ) ).to.equal("number")
        })

        it("should return regexp for regExp literals and RegExp instances", function(){
            chai.expect( _.typeof( new RegExp("foo") ) ).to.equal("regexp")
            chai.expect( _.typeof( /foo/ ) ).to.equal("regexp")
        })

        it("should return array for array literals and Array instances", function(){
            chai.expect( _.typeof( new Array(2) ) ).to.equal("array")
            chai.expect( _.typeof( [,] ) ).to.equal("array")
        })

        it("should return arguments for arguments", function(){
            void function(){
                chai.expect( _.typeof(arguments) ).to.equal("arguments")
            }(1,2,3)
        })

        it("should generally return the equivalent of Object.prototype.toString(o).slice(8, -1).toLowerCase()", function(){
            chai.expect( _.typeof(document.createElement("div")) ).to.equal("htmldivelement")
        })
    })

    describe("#invoke", function(){
        it("should...", function(){
            throw Error
        })
    })

})
