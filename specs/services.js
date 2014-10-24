describe("services", function(){
    var service = new korbut.Service("/base/specs/services.js", function(req){
        return "foo"
    })

    var serviceb = new korbut.Service("/base/specs/services.js", function(req){
        return "foo"
    })


    korbut.Promise.all([
        service.request(function(err, status, request){
            console.log("a", status, request)
        }).then(function(request){
            console.log("b", request)
        })

      , serviceb.request(function(err, status, request){
            console.log("c", status, request)
        }).then(function(request){
            console.log("d", request)
        })
    ]).then(function(){
        console.log("e")
    })
})
