var target = 'http://cas2:8080';
var http = require('http'),
    httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var colors = require('colors');


var welcome = [
  '#    # ##### ##### #####        #####  #####   ####  #    # #   #',
  '#    #   #     #   #    #       #    # #    # #    #  #  #   # # ',
  '######   #     #   #    # ##### #    # #    # #    #   ##     #  ',
  '#    #   #     #   #####        #####  #####  #    #   ##     #  ',
  '#    #   #     #   #            #      #   #  #    #  #  #    #  ',
  '#    #   #     #   #            #      #    #  ####  #    #   #  '
].join('\n');

console.log(welcome.rainbow.bold);

var server = http.createServer(function(req, res) {
    proxy.web(req, res, {
        target: target,
        secure: false,
        ws: false,
        prependPath: false,
        ignorePath: false,
    });
});

function logInfo(text) {
  console.log(text.green);
}


console.log("listening on port 9191")
server.listen(9191);

// Listen for the `error` event on `proxy`.
// as we will generate a big bunch of errors
proxy.on('error', function (err, req, res) {
  console.log(err)
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end("Oops");
});


proxy.on('proxyRes', function(proxyRes, req, res) {
  logInfo('==================== >>>>> ' + target + '====================');
  console.log('Protocol:'.blue + req.protocol);
  console.log('Proxying:'.blue , req.url);
  console.log('Body:'.blue , req.body);
  console.log('RAW Response from the target'.blue, JSON.stringify(proxyRes.headers, true, 2));
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
});

//
// Listen for the `close` event on `proxy`.
//
proxy.on('close', function (res, socket, head) {
  // view disconnected websocket connections
  console.log('Client disconnected'.red);
});
