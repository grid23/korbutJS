window.ss1 = new korbut.Stylesheet(["html, body{height:100%;background: red;}"])
window.r1 = new korbut.CSSRule("html, body", "background:blue")
window.r2 = new korbut.CSSRule("html, body", "background:red", "max-width:600px")
window.r3 = new korbut.CSSRule("html, body", "background:blue", "max-width:400px")
window.ss2 = new korbut.Stylesheet
ss2.insertRule(r1)
ss2.insertRule("html, body{background:white;}")
ss2.insertRule(r2)
ss2.insertRule(r3)

/*
var s1 = new korbut.Stylesheet(["#foo{height:100px;background:red;}"])
var rule = new korbut.CSSRule("#foo", "background:blue")
var s2 = new korbut.Stylesheet
s2.insertRule(s2)
*/

describe("korbut.Stylesheet", function(){
    //console.log( document.body.insertBefore( new document.createElement("div"), document.body.childNodes[0] ) )

    //.id = "foo"

    korbut.domReady.then(function(e){
        e.nodes.body.insertBefore(document.createElement("div"), e.nodes.body.childNodes[0]).id = "foo"
    })



    describe("#isLocalFile", function(){
        it("should return true|false depending if the passed href is a local or external href", function(){
            chai.expect(korbut.Stylesheet.isLocalFile("https://developer.cdn.mozilla.net/media/css/mdn-min.css")).to.be.false
            chai.expect(korbut.Stylesheet.isLocalFile("/mediaa/css/mdn-min.css")).to.be.true
        })
    })

    describe("new korbut.Stylesheet", function(){

        describe("(external_css_href)", function(){
            /*
            var ss = new korbut.Stylesheet("https://developer.cdn.mozilla.net/media/css/mdn-min.css")

            it ("should return a valid instance", function(){
                chai.expect(korbut.Stylesheet.isImplementedBy(ss)).to.be.true
            })

            it("should not allow to add/delete a rule on external file", function(){
                chai.expect(ss.insertRule()).to.be.equal(null)
                chai.expect(ss.deleteRule()).to.be.equal(null)
            })
            */
        })

    })
})
