describe("korbut.IDB", function(){
    //var dba = new korbut.IDB("dba")

    describe("| instantiation", function(){
        it ("should return a korbut.IDB instance", function(){
            //chai.expect(korbut.IDB.isImplementedBy(dba)).to.be.true
        })
    })


})



setTimeout(function(){

    console.log("create idb instance, window.dba, with { name: test, version: 1 }")

    var dba = window.dba = new korbut.IDB("test")
    var storea = window.storea = new korbut.IDBStore("foo", {
            keyPath: "foo"
          , indexes: {
                by_foo: {
                    keyPath: "foo"
                  , unique: false
                }
            }
        })

    //indexedDB.deleteDatabase("test")


    /*
    dba.store(storea, function(err){
        var broker = new korbut.IDBBroker(dba, storea)

        console.log("test cb")
        broker.put({foo: "bar"}).then(function(){
            broker.get("bar")
        })
    })
    */

        var db = new korbut.IDB("test")
        var store = new korbut.IDBStore("foo", { keypath: "foo" })
        var broker = new korbut.IDBBroker(db, store)
        var broker2 = new korbut.IDBBroker(db, store)


        broker.put({ "foo": "a" }, function(){
            console.log("put", arguments)
        })
        broker2.get("a")
        broker.get("bar")

}, 1000)
