//var couchUrl = "epam-tasks-app.iriscouch.com";
//var couchPort = 80;
var couchUrl = "localhost";
var couchPort = 5984;


var http = require('http');
var fs = require('fs');
var mime = require('mime');
var port = process.env.PORT || 8888;
console.log("Starting")
http.createServer(function (req, res) {
    if (req.url.lastIndexOf("/couch", 0) === 0) {// check if url starts with '/couch'
        var headers = req.headers;
        headers.host = couchUrl;

        delete headers.authorization;// temporary

        var data;
        var options = {
            hostname: couchUrl,
            port: couchPort,
            path: req.url.replace("/couch", ""),
            method: req.method,
            headers: headers
        };

        var request = http.request(options, function (response) {
            response.pipe(res);

        });
        if (req.method == 'POST' || req.method == 'PUT') {
            req.on("data", function (body) {
                request.write(body);
                request.end();
            })
        } else {
            request.end();
        }

    } else {
        var file = req.url === '/' ? 'index.html' : req.url.substr(1);
        fs.exists(file, function (exists) {
            if (exists) {
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
console.log("server started on port " + port);