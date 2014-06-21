var http = require('http');
var fs = require('fs');
var mime = require('mime');
var couchUrl = "epam-tasks-app.iriscouch.com";
var port = process.env.PORT || 8888;
console.log("Starting")
http.createServer(function(req, res){
    if (req.url.lastIndexOf("/couch", 0) === 0){// check if url starts with '/couch'
        var headers = req.headers;
        headers.host = couchUrl;

        delete headers.authorization;// temporary

        var options = {
            hostname: couchUrl,
            port: req.port,
            path: req.url.replace("/couch", ""),
            method: req.method,
            headers:headers
        };
         http.request(options,function(response){
            response.pipe(res);

        }).end();
    } else {
        var file = req.url === '/' ? 'index.html' : req.url.substr(1);
        fs.exists(file, function(exists){
            if (exists){
                var stat = fs.statSync(file);

                res.writeHead(200, {
                    'Content-Type': mime.lookup(file),
                    'Content-Length': stat.size
                });

                fs.createReadStream(file).pipe(res);
            } else {
                res.statusCode = 404;
                res.end();
            }
        });
    }
}).listen(port);
console.log("server started on port "+ port );