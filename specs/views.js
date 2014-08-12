describe("korbut.Template", function(){

    describe("| instantiation", function(){

        it("should return a valid korbut.Template instance", function(){
            chai.expect(korbut.Template.isImplementedBy(new korbut.Template)).to.be.true
        })
    })

    describe("| extending", function(){
        it("should let the render method to be overwritten", function(){
            var T = korbut.Template.extend({
                    render: function(){
                        return true
                    }
                })

            chai.expect(korbut.Template.isImplementedBy(new T)).to.be.true
            chai.expect(new T().render()).to.be.true
        })
    })

    describe("=>render()", function(){
        it("should throw an error if it hasn't been locally defined", function(){
            try {
                new korbut.Template().render()
            } catch(e){
                chai.expect(true).to.be.true
                return
            }
            throw new Error("korbut.Template().render() did not throw")
        })
    })

})

describe("korbut.View", function(){
    var T = korbut.Template.extend({
            render: function(data){
                //console.log(data)
                data = data || {}
                return "<div><span data-k-ref=foo>"+data.foo+"</span></div><div><span data-k-ref=foo>"+data.foo+"</span></div>\
                "
            }
        })
    var V = korbut.View.extend({
            constructor: function(){
                korbut.View.apply(this, arguments)
            }
          , _Template: T
        })

    describe("| instantiation", function(){
        it('should return a valid instance', function(){
            chai.expect(korbut.View.isImplementedBy(new V({foo:"bar"}))).to.be.true
        })

        it("should return a valid dom subtree", function(){
            var a = new V({foo:"bar"})
            var b = new V

            chai.expect(a.root.length).to.be.equal(2)
            chai.expect(a.queryAll("root").length).to.be.equal(2)
            chai.expect(a.queryAll("foo").length).to.be.equal(2)
            chai.expect(a.query("foo").textContent).to.be.equal("bar")
        })
    })

    describe("#getByUid()", function(){
        it("should return a view by its uid", function(){
            var v = new V
            var uid = v.uid

            chai.expect(korbut.View.getByUid(uid)).to.be.equal(v)
        })
    })

})
