void function(karma, path, child_process, q, child){
    process.on("exit", kill)

    module.exports.start = function(dfd){
        dfd = q.defer()

        if ( child )
          kill()

        child = child_process.spawn("node", [
            path.join(__dirname, "karma-background.js")
        ])

        child.stdout.on("data", function(data){
            process.stdout.write(data)
        })



        setTimeout(function(){
            dfd.resolve()
        }, 2500)


        return dfd.promise
    }

    module.exports.run = function(dfd, runner){
        dfd = q.defer()

        karma.runner.run({port: 9876}, function(){
            dfd.resolve()
        })

        return dfd.promise
    }

    function kill(){
        if ( !child )
          return

        child_process.exec("kill -9 "+child.pid, function(){
            console.log("karma server killed!")
        })
        child = null
    }
}( require("karma"), require("path"), require("child_process"), require("q") )
