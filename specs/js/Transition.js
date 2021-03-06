describe("korbut.Transition", function(){
    var stylesheet = new korbut.Stylesheet()
    var zen = korbut.ZParser.parse("div#specsa@a > div#specsb@b{foo} ")
    var diva = zen.vars.a[0]
    var divb = zen.vars.b[0]
    var transition = new korbut.Transition(divb, { opacity: "1s", top: "5s", left: "1s" })

    window.a = stylesheet.insertRule("#specsa{position:relative;width:200px;height:200px;background:black;}")
    window.b = stylesheet.insertRule("#specsb{position:absolute;top:0;left:0;width:50px;height:50px;background:white;z-index:1}")
    ;(window["tests"]||document.body).appendChild(zen.tree)

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


    x()

    document.body.addEventListener("click", function(e){
        x()
    })

    describe("| instantiation", function(){
        it("should return a korbut.Event instance", function(){

        })
    })




})
