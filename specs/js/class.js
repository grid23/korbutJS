describe("korbut.class", function(){
    describe("| invocation", function(){

        describe("| korbut.class(prototype)", function(){
            it("should accept a simple ES3 object as prototype", function(){
                var C = korbut.class({
                    foo: function(){
                        return this !== window && this !== null
                    }
                })
                chai.expect(new C().foo()).to.be.true
            })

            it("should accept a ES5 properties object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)", function(){
                var C = korbut.class({
                    foo: { enumerable: true,
                        value: function(){
                            return this !== window && this !== null
                        }
                    }
                })
                chai.expect(new C().foo()).to.be.true
            })

            it("should accept a mixed ES3 object/ES5 properties object object", function(){
                var C = korbut.class({
                    foo: { enumerable: true,
                        value: function(){
                            return this !== window && this !== null
                        }
                    }
                  , bar: function(){
                        return this !== window && this !== null
                    }
                })
                chai.expect(new C().foo()).to.be.true
                chai.expect(new C().bar()).to.be.true
            })

            it("should accept a function returning either an ES3 object, an ES5 properties object, or a mixed ES3/ES5object", function(){
                var C = korbut.class(function(){
                    return {
                        foo: function(){
                            return this !== window && this !== null
                        }
                    }
                })

                var D = korbut.class(function(){
                    return {
                        foo: { enumerable: true,
                            value: function(){
                                return this !== window && this !== null
                            }
                        }
                    }
                })

                var E = korbut.class(function(){
                    return {
                        foo: { enumerable: true,
                            value: function(){
                                return this !== window && this !== null
                            }
                        }
                      , bar: function(){
                            return this !== window && this !== null
                        }
                    }
                })
                chai.expect(new C().foo()).to.be.true
                chai.expect(new C().foo()).to.be.true
                chai.expect(new E().foo()).to.be.true
                chai.expect(new E().bar()).to.be.true
            })
        })

        describe("| korbut.class([parent[, ...parents]], prototype)", function(){
            it("should accept 1 or x objects as parent(s)", function(){
                var A = korbut.class({ foo: "bar" })
                var B = korbut.class({ bar: "foo" })
                var C = korbut.class(A, { foobar: "foo" })
                var D = korbut.class(A, B, C, { barfoo: "bar" })

                chai.expect(new C().foo).to.equal("bar")
                chai.expect(new D().foo).to.equal("bar")
                chai.expect(new D().bar).to.equal("foo")
                chai.expect(new D().foobar).to.equal("foo")
                chai.expect(new D().barfoo).to.equal("bar")
            })

            it("should override properties from leftest parent to prototype", function(){
                var A = korbut.class({ foo: "a" })
                var B = korbut.class({ foo: "b" })
                var C = korbut.class(B, A, {})
                var D = korbut.class(A, B, { foo: "d" })

                chai.expect(new C().foo).to.equal("a")
                chai.expect(new D().foo).to.equal("d")
            })
        })

        describe("| inheritance rules", function(){
            it("should create ES3 object properties with ES5 descriptors { configurable: true, enumerable: true, writable: true  }", function(){
                var C = korbut.class({
                    foo: function(){
                        return this !== window && this !== null
                    }
                })
                var desc = Object.getOwnPropertyDescriptor(C.prototype, "foo")
                chai.expect(desc.configurable).to.be.true
                chai.expect(desc.enumerable).to.be.true
                chai.expect(desc.writable).to.be.true
            })

            it("should respect ES5 descriptors", function(){
                var C = korbut.class({
                    foo: { enumerable: true, configurable: true, writable: true,
                        value: function(){
                            return this !== window && this !== null
                        }
                    }
                })
                var desc = Object.getOwnPropertyDescriptor(C.prototype, "foo")
                chai.expect(desc.configurable).to.be.true
                chai.expect(desc.enumerable).to.be.true
                chai.expect(desc.writable).to.be.true
            })

            it("should allow overriding a property with { configurable: true } descriptor", function(){
                var A = korbut.class({ foo: "a" })
                var B = korbut.class(A, { foo: { configurable: true, value: "b" }  })
                var C = korbut.class(A, B, { foo: "c" })

                chai.expect(new C().foo).to.equal("c")
            })

            it("should forbid overriding a property with { configurable: false}", function(){
                var throws

                try {
                    var A = korbut.class({ foo: { configurable: false, value: "a" } })
                    var B = korbut.class(A, { foo: "b" })
                } catch(e){
                    throws = true
                }

                chai.expect(throws).to.true
            })
        })

        describe("| static properties", function(){
            it("should create a static 'create' property", function(){
                var C = korbut.class({
                    foo: function(){
                        return this !== window && this !== null
                    }
                })
                chai.expect(C.create().foo()).to.be.true
            })

            it("should create a static 'extend' property", function(){
                var C = korbut.class({
                    foo: function(){
                        return this !== window && this !== null
                    }
                })
                var D = C.extend({})
                chai.expect(new D().foo()).to.be.true
            })

            it("should create a static 'isImplementedBy' property", function(){
                var C = korbut.class({
                    foo: function(){
                        return this !== window && this !== null
                    }
                })

                chai.expect(C.isImplementedBy(C)).to.be.true
                chai.expect(C.isImplementedBy(new C)).to.be.true
            })

            it("should create a static 'implementsOn' property", function(){
                var C = korbut.class({
                    foo: function(){
                        return this !== window && this !== null
                    }
                })
                var c = {}
                C.implementsOn(c)

                chai.expect(c.foo()).to.be.true
            })
        })

        describe("| polymorphism", function(){
            describe("korbut.class#isImplementedBy()", function(){
                it("should only inspect prototype properties, not 'own' properties", function(){
                    var C = korbut.class({
                        foo: function(){ return this !== window && this !== null }
                    })
                    var d = { foo: C.prototype.foo }
                    var e = { prototype: { foo: C.prototype.foo }}

                    chai.expect( C.isImplementedBy(d) ).to.be.false
                    chai.expect( C.isImplementedBy(e) ).to.be.true
                })

                it("should return true when a `configurable:true` property is of the same type for the class and the inspected object", function(){
                    var C = korbut.class({
                        foo: { configurable: true,
                            value: function(){ return this !== window && this !== null }
                        }
                    })
                    var d = { prototype: { foo: function(){} }}
                    var E = korbut.class(C, {
                        foo: {
                            value: function(){}
                        }
                    })

                    chai.expect(C.isImplementedBy(d)).to.be.true
                    chai.expect(C.isImplementedBy(E)).to.be.true
                })

                it("should be able to inspect other class objects", function(){
                    var C = korbut.class({
                        foo: { configurable: true,
                            value: function(){ return this !== window && this !== null }
                        }
                    })
                    var D = korbut.class(C, {})

                    chai.expect(C.isImplementedBy(D)).to.be.true
                })
            })

            describe("korbut.class#implementsOn", function(){
                it("should apply all properties of a class to a given object and make it a valid implementation of that class", function(){
                    var C = korbut.class({
                        foo: function(){ return this !== window && this !== null }
                      , bar: { enumerable: false, configurable: false,
                          value: function(){ return this !== window && this !== null }
                        }
                    })

                    var d = {}
                    C.implementsOn(d)
                    var e = { foo: C.prototype.foo, bar: C.prototype.bar }
                    var f = { prototype: { foo: C.prototype.foo, bar: C.prototype.bar } }

                    var desc = Object.getOwnPropertyDescriptor(d, "bar")

                    chai.expect(d.foo()).to.be.true
                    chai.expect(C.isImplementedBy(d)).to.be.true
                    chai.expect(C.isImplementedBy(e)).to.be.false
                    chai.expect(C.isImplementedBy(f)).to.be.true

                    chai.expect(desc.configurable).to.be.false
                    chai.expect(desc.enumerable).to.be.false
                    chai.expect(desc.writable).to.be.false
                })

                it("should apply the constructor of the class on the implemented object, with the passed arguments", function(){
                    var C = korbut.class({
                        constructor: function(a, b){
                            this.a = a
                            this.b = b
                        }
                      , foo: function(){ return this !== window && this !== null }
                      , bar: { enumerable: false, configurable: false,
                          value: function(){ return this !== window && this !== null }
                        }
                    })

                    var d = {}
                    C.implementsOn(d, "a", "b")

                    chai.expect( C.isImplementedBy(d) ).to.be.true
                    chai.expect(d.a).to.be.equal("a")
                    chai.expect(d.b).to.be.equal("b")
                })
            })

        })

    })
})
