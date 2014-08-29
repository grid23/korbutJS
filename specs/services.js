describe("services", function(){
    var service = new korbut.Service("/base/specs/services.js", function(req){
        return "foo"
    })
    service.request(function(err, status, request){
        console.log("b", status, request)
    }).then(function(request){
        console.log("c", request)
    })
})
