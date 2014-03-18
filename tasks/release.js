void function(fs, path, q, fconcat, fbuild, fversion, fpackage, fbower, parchive, header){ "use strict"
    fconcat = path.join(__dirname, "../dist/korbut.js")
    fbuild = path.join(__dirname, "../dist/korbut.min.js")
    fversion = path.join(__dirname, "../.version")
    fpackage = path.join(__dirname, "../package.json")
    fbower = path.join(__dirname, "../bower.json")
    parchive = path.join(__dirname, "../archive")

    header = "/* foo! */\n\n"

    module.exports.save = function(){ return release(0) }
    module.exports.revision = function(){ return release(1) }
    module.exports.minor = function(){ return release(2) }
    module.exports.major = function(){ return release(3) }

    function release(what){
        return function(dfd){
            dfd = q.defer()

            getCurrentVersion()
              .then(updateVersion(what), onerror)

              .then(updateFiles(what>0?1:0), onerror)

              .then(function(){
                  dfd.resolve()
              }, onerror)

            return dfd.promise

            function onerror(e){
                dfd.reject(e)
            }
        }()
    }

    function updateVersion(what){
        return function(version){
            version.timestamp = +(new Date)
            if ( what == 1 ) version.revision += 1
            if ( what == 2 ) version.minor += 1, version.revision = 0
            if ( what == 3 ) version.major += 1, version.minor = 0, version.revision = 0

            version.string = [
                [version.major, version.minor, version.revision].join(".")
              , version.timestamp
            ].join("-")

            console.log("new version:", version.string)
            return version
        }
    }

    function updateFiles(archive){

        return function(version, dfd, tasks){
            tasks = [ u_fversion(version), u_fbower(version), u_fpackage(version), u_fconcat(version), u_fbuild(version) ]

            if ( archive )
              tasks.push(u_archive(version))

            dfd = q.all(tasks)
            return dfd.promise
        }
    }

    function getCurrentVersion(dfd, version){
        dfd = q.defer()

        fs.readFile(fversion, "utf8", function(err, buffer){
            if ( err )
              return dfd.reject(err)

            try {
                version = JSON.parse(buffer)
            } catch (err) {
                return dfd.reject(err)
            }

            dfd.resolve(version)
        })

        return dfd.promise
    }

    function u_fversion(version, dfd){
        dfd = q.defer()

        fs.writeFile(fversion, JSON.stringify(version), "utf8", function(err){
            if ( err )
              return dfd.reject(err)

            dfd.resolve()
        })

        return dfd.promise
    }

    function u_fpackage(version, dfd){
        dfd = q.defer()

        fs.exists(fpackage, function(exists){
            if ( !exists )
              return dfd.resolve()

            fs.readFile(fpackage, "utf8", function(err, buffer, pack){
                if ( err )
                  dfd.reject(err)

                try {
                    pack = JSON.parse(buffer)
                } catch ( err ) {
                    return dfd.reject(err)
                }

                pack.version = version.string

                fs.writeFile(fpackage, JSON.stringify(pack), "utf8", function(err){
                    if ( err )
                      return dfd.reject(err)

                    dfd.resolve()
                })
            })
        })

        return dfd.promise
    }

    function u_fbower(version, dfd){
        dfd = q.defer()

        fs.exists(fbower, function(exists){
            if ( !exists )
              return dfd.resolve()

            fs.readFile(fbower, "utf8", function(err, buffer, bower){
                if ( err )
                  dfd.reject(err)

                try {
                    bower = JSON.parse(buffer)
                } catch ( err ) {
                    return dfd.reject(err)
                }

                bower.version = version.string

                fs.writeFile(fbower, JSON.stringify(bower), "utf8", function(err){
                    if ( err )
                      return dfd.reject(err)

                    dfd.resolve()
                })
            })
        })

        return dfd.promise
    }

    function u_fconcat(version, dfd){
        dfd = q.defer()

        fs.exists(fconcat, function(exists){
            if ( !exists )
              return dfd.resolve()

            fs.readFile(fconcat, "utf8", function(err, buffer){
                if ( err )
                  dfd.reject(err)

                fs.writeFile(fconcat, header + buffer.replace("x.y.z-t", version.string), "utf8", function(err){
                    if ( err )
                      return dfd.reject(err)

                    dfd.resolve()
                })
            })
        })

        return dfd.promise
    }

    function u_fbuild(version, dfd){
        dfd = q.defer()

        fs.exists(fbuild, function(exists){
            if ( !exists )
              return dfd.resolve()

            fs.readFile(fbuild, "utf8", function(err, buffer){
                if ( err )
                  dfd.reject(err)

                fs.writeFile(fbuild, header + buffer.replace("x.y.z-t", version.string), "utf8", function(err){
                    if ( err )
                      return dfd.reject(err)

                    dfd.resolve()
                })
            })
        })

        return dfd.promise
    }

    function u_archive(version, dfd){
        dfd = q.defer()

        fs.exists(parchive, function onexists(exists){
            if ( !exists )
              return fs.mkdir(parchive, function(err){
                  if (err)
                    dfd.reject(err)

                  onexists(version)
              })

              fs.readFile(fbuild, "utf8", function(err, buffer, fname){
                  if ( err )
                    dfd.reject(err)

                  fname = [parchive, "/korbut.min.", [version.major, version.minor, version.revision].join("."), ".js"].join("")

                  fs.writeFile(fname, buffer, "utf8", function(err){
                      if ( err )
                        return dfd.reject(err)

                      dfd.resolve()
                  })
              })
        })

        return dfd.promise
    }
}( require("fs"), require("path"), require("q") )
