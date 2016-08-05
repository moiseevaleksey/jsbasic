var http = require("http");
var fs = require("fs");

var methods = Object.create(null);

http.createServer(function(request, response) {
  function respond(code, body, type) {
    if (!type) type = "text/plain";
      response.writeHead(code, {"Content-Type": type});
    if (body && body.pipe)
      body.pipe(response);
    else
      response.end(body);
  }
  if (request.method in methods) 
      methods[request.method](urlToPath(request.url), respond, request);
  else
    respond(405, "Method " + request.method + " not allowed");
}).listen(8000);

function urlToPath(url) {
  var path = require("url").parse(url).pathname;
  var strN = decodeURIComponent(path);
  return "." + strN.replace(/(\/|\\)\.\.(\/|\\|$)/g, "/");
}

methods.GET = function(path, respond) {
  fs.stat(path, function(error, stats) {
    if (error && error.code == "ENOENT")
      respond(404, "File not found");
    else if (error)
      respond(500, error.toString());
    else if (stats.isDirectory())
      fs.readdir(path, function(error, files) {
        if (error)
          respond(500, error.toString());
        else
          respond(200, files.join("\n"));
      });
    else
      respond(200, fs.createReadStream(path), require("mime").lookup(path));
  });
}; 