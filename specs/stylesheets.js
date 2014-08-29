describe("stylesheets", function(){

    describe("korbut.Stylesheet", function(){
        describe("#isLocalFile", function(){
            it("should return true|false depending if the passed href is a local or external href", function(){
                chai.expect(korbut.Stylesheet.isLocalFile("https://developer.cdn.mozilla.net/media/css/mdn-min.css")).to.be.false
                chai.expect(korbut.Stylesheet.isLocalFile("/media/css/mdn-min.css")).to.be.true
            })
        })
    })

    describe("new korbut.Stylesheet", function(){

        describe("(external_css_href)", function(){
            var ss = new korbut.Stylesheet("https://developer.cdn.mozilla.net/media/css/mdn-min.css")

            it ("should return a valid instance", function(){
                chai.expect(korbut.Stylesheet.isImplementedBy(ss)).to.be.true
            })

            it("should not allow to add/delete a rule on external file", function(){
                chai.expect(ss.insertRule()).to.be.equal(0)
                chai.expect(ss.deleteRule()).to.be.equal(0)
            })
        })

    })
})
