describe("korbut.class", function(){

    describe("| invocation", function(){
          var A = korbut.class({
                        foo: function(){
                            return this !== window && this !== null
                        }
                    })
          var B = korbut.class({
                      foo: {
                          value: function(){
                              return this !== window && this !== null
                          }
                      }
                  })
          var C = korbut.class({
                      foo: { configurable: true,
                          value: function(){
                              return this !== window && this !== null
                          }
                      }
                    , bar: function(){
                          return this !== window && this !== null
                      }
                  })

          var D = korbut.class(function(statics){
                      statics.foo = "foobar"

                      return {
                          foo: function(){
                              return this !== window && this !== null
                          }
                      }
                    })
          var E = korbut.class(function(statics){
                      Object.defineProperty(statics, "foo", { enumerable: true, value: "foobar" })

                      return {
                          foo: {
                              value: function(){
                                  return this !== window && this !== null
                              }
                          }
                      }
                  })

          var F = korbut.class(function(statics){
                      Object.defineProperty(statics, "foo", { enumerable: false, value: "foobar" })
                      statics.bar = "barfoo"

                      return {
                          foo: {
                              value: function(){
                                  return this !== window && this !== null
                              }
                          }
                        , bar: function(){
                              return this !== window && this !== null
                          }
                      }
                  })

          var G = korbut.class(A, {
                      bar: {
                          value: function(){
                              return this !== window && this !== null
                          }
                      }
                  })

          var H = korbut.class(A, {
                      bar:  function(){
                          return this !== window && this !== null
                      }
                  })

          var I = korbut.class(A, {
                      bar:  function(){
                          return this !== window && this !== null
                      }
                    , fu: {
                          value: function(){
                              return this !== window && this !== null
                          }
                      }
                  })

          var J = korbut.class(A, function(){
                      return {
                          bar: {
                              value: function(){
                                  return this !== window && this !== null
                              }
                          }
                      }
                  })

          var I = korbut.class(A, function(){
                      return {
                          bar:  function(){
                            return this !== window && this !== null
                          }
                      }
                  })

          var J = korbut.class(A, function(){
                  return {
                      bar:  function(){
                          return this !== window && this !== null
                      }
                    , fu: {
                          value: function(){
                              return this !== window && this !== null
                          }
                      }
                  }
              })

          var a = new A
          var b = new B
          var c = new C
          var d = new D
          var e = new E
          var f = new F
          var g = new G
          var h = new H
          var i = new I
          var j = new J

          it("should work with a simple object as prototype", function(){
              chai.expect(a.foo()).to.be.true
          })

          it("should work a descriptors object as prototype", function(){
              chai.expect(b.foo()).to.be.true
          })

          it("should work with a mixed object (key and descriptors)", function(){
              chai.expect(c.foo() && c.bar()).to.be.true
          })

          it("should work with a function returning either an object, a descriptors object, or a mixed key/descriptors object", function(){
              chai.expect(d.foo() && e.foo() && f.foo() && f.bar()).to.be.true
          })

          it("should inherit from another object passed as first argument, with either form to describe the added prototype", function(){
              chai.expect(g.foo() && g.bar()).to.be.true
              chai.expect(h.foo() && h.bar()).to.be.true
              chai.expect(i.foo() && i.bar()).to.be.true
              chai.expect(j.foo() && j.bar() && j.fu()).to.be.true
          })

          it("should create properties from keys to be { configurable:true, enumerable: true, writable: true } by default", function(){
              var desc = Object.getOwnPropertyDescriptor(A.prototype, "foo")

              chai.expect(desc.configurable).to.be.true
              chai.expect(desc.enumerable).to.be.true
              chai.expect(desc.writable).to.be.true
          })

          it("should create a shortcut `create` static method to the returned class", function(){
              chai.expect(A.create).to.be.a("function")
          })

          it("should create a shortcut `extend` static method to the returned class", function(){
              chai.expect(A.extend).to.be.a("function")
          })

          it("should create a `isImplementedBy` static method to the returned class", function(){
              chai.expect(A.isImplementedBy).to.be.a("function")
          })

          it("should create a `implementsOn` static method to the return class", function(){
              chai.expect(A.implementsOn).to.be.a("function")
          })

          it("should create all properties from the statics argument 0 of the function form, with the same descriptos that they have been created with", function(){
              chai.expect(D.foo).to.equal("foobar")
              chai.expect(E.foo).to.equal("foobar")
              chai.expect(Object.getOwnPropertyDescriptor(D, "foo").enumerable).to.be.true
              chai.expect(Object.getOwnPropertyDescriptor(E, "foo").enumerable).to.be.true
              chai.expect(Object.getOwnPropertyDescriptor(F, "foo").enumerable).to.be.false
          })

          it("should throw an error if one tries to over-ride a non-configurable properties", function(){
              var throws

              try {
                  korbut.class(B, { foo: function(){} })
                  throws = false
              } catch(e) {
                  throws = true
              }

              chai.expect(throws).to.be.true
          })

          it("should *not* throw an error if one tries to over-ride a configurable properties", function(){
              var throws

              try {
                  korbut.class(C, { foo: function(){ } })
                  throws = false
              } catch(e) {
                  throws = true
              }

              chai.expect(throws).to.be.false
          })

    })

    describe("| std static methods", function(){

        var A = korbut.class({ foo: function(){} })
        var B = A.extend({ bar: function(){} })
        var b = B.create()
        var c = {}
        var D = korbut.class({ foo: function(){} })
        var E = korbut.class({ foo: { value: function(){} } })
        B.implementsOn(c)

        describe("#extend()", function(){
            it("should return a new instantiable class inheriting from the object the method has been called from", function(){
                chai.expect(B.prototype.foo).to.be.a("function")
                chai.expect(B.prototype.foo === A.prototype.foo).to.be.true
                chai.expect(B.prototype.bar).to.be.a("function")
            })
        })

        describe("#create()", function(){
            it("should return a new instance of the object the method has been called from", function(){
                chai.expect(b.foo).to.be.a("function")
                chai.expect(b.foo === A.prototype.foo).to.be.true
                chai.expect(b.bar).to.be.a("function")
                chai.expect(b.bar === B.prototype.bar).to.be.true
            })
        })

        describe("#isImplementedBy()", function(){
            it("should return true when all class properties are shared with the inspected object...", function(){
                chai.expect(B.isImplementedBy(b)).to.be.true
                chai.expect(A.isImplementedBy(b)).to.be.true
            })

            it("should return true when a configurable propertie is of the same type for the class and the inspected object", function(){
                chai.expect(D.isImplementedBy(b)).to.be.true
            })

            it("should return false when a property is missing from the inspected object", function(){
                chai.expect(E.isImplementedBy(b)).to.be.false
            })
        })

        describe("#implementsOn()", function(){
            it("should apply all properties of a class to a given object and make it a valid implementation of that class", function(){
                chai.expect(c.foo === A.prototype.foo).to.be.true
                chai.expect(c.bar === B.prototype.bar).to.be.true
                chai.expect(A.isImplementedBy(c)).to.be.true
                chai.expect(B.isImplementedBy(c)).to.be.true
            })
        })
    })
})

describe("korbut.singleton", function(){
    var S = korbut.singleton({
            foo: {
                value: function(){
                    return this !== window && this !== null
                }
            }
        })
    var s = new S
    var t = new S

    it("should work like korbut.class, except you can only have one instance of the class at any given time", function(){
        chai.expect(s === t).to.be.true
    })
})
