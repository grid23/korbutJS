describe("korbut.Transition", function(){
    var stylesheet = new korbut.Stylesheet()
    var zen = korbut.ZenParser.parse("div#specsa@a > div#specsb@b{foo} ")
    var diva = zen.vars.a[0]
    var divb = zen.vars.b[0]
    var transition = new korbut.Transition(divb, { opacity: "1s", top: "1s", left: "1s" })

    stylesheet.insertRule("#specsa{position:relative;width:200px;height:200px;background:black;}")
    stylesheet.insertRule("#specsb{position:absolute;top:0;left:0;width:50px;height:50px;background:white;z-index:1}")
    document.body.appendChild(zen.tree)

    function a(){
        return transition.animate({ top: "150px", left: "150px", opacity: "0.5" })
    }

    function b(){
        return transition.animate({ top: "0px", left: "150px", opacity: "0.8" })
    }

    function c(){
        return transition.animate({ top: "150px", left: "0px", opacity: "0.1" })
    }

    function d(){
        return transition.animate({ top: "0", left: "0", opacity: "1" })
    }

    function x(){
        return a().then(b).then(c).then(d)
    }

    setTimeout(function(){
        x().then(x)
    }, 2000)

    describe("| instantiation", function(){
        it("should return a korbut.Event instance", function(){

        })
    })




})
