/*
 Primary file for the api
 */

 //deps
 //for http server
 const http = require('http');
 //for https server
 const https = require('https');
 //for parsing the url
 const url = require('url');
 //for parsing payload from request
 const StringDecoder = require('string_decoder').StringDecoder;
 //get config...
 const config = require('./config'); //this is the envToExport from that file...
 const fs = require('fs');
 const dataLib = require('./lib/data');

 //quick tets for data writing...
 /*dataLib.create('temp', 'tempfile', {'a':100}, (err) => {
    console.log(err);
 });*/

 //All server logic here
let unifiedServer = (req, res) => {
    console.log('herer');
    //this is the callback for requests

    //get the url & parse it (true = parse the query string, too)
    var parsedUrl = url.parse(req.url, true); //UrlWithParsedQuery

    //get the path from the url
    var path = parsedUrl.pathname;
    //trim path of extraneous slashes on either side
    var trimmedPath = path.replace(/^\/+|\/+s/g,''); //String

    //get the query string (parsed as key/value pairs)...
    var urlQuery = parsedUrl.query; //ParsedUrlQuery

    //get the HTTP method...
    var method = req.method.toLowerCase(); //String

    //get the headers...
    var headers = req.headers; //IncomingHeaders

    //decode the payload...
    var decoder = new StringDecoder('utf-8');
    //hold the payload as the stream comes in...
    var buffer = '';
    //listen for the "data" event on the incoming request.  as it is received, add to the buffer...
    req.on("data", (data) => {
        //append data from the stream...
        //'data' is undecoded data.  here we will decode it from utf-8 and append it to our buffer...
        console.log("data event ", data);
        buffer += decoder.write(data);
        console.log('decoded: ', buffer);
    });

    //listen for the end of the stream from the request...
    req.on("end", () => {
        //wrap up the stream...
        buffer += decoder.end();

        //choose our handler form the router, or the notFound one if the path isn't defined...
        var chosenHandler = typeof(router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notFound;

        //construct the data to send ot the handler...
        var data = {
            'trimmedPath': trimmedPath,
            'urlQuery': urlQuery,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        //call the handler...
        chosenHandler(data, (statusCode, payload) => {
            //default to status 200 if not given
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //default to empty obj if not give
            payload = typeof(payload) == 'object' ? payload : {};

            //convert the payload to a string...
            var payloadString = JSON.stringify(payload);

            //now return...
            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(payloadString);

        });

        //log the path from the request
        console.log('Received request on ' + trimmedPath + " with method: " + method + " with query: ", urlQuery);
        console.log('Headers: ', headers);

        console.log("Payload was: ", buffer);
    });
};

//server should respond to all requests with a string
/*var serverHttp = http.createServer((req, res) => {
    unifiedServer(req, res);
});*/

//small functional programing refactor - transitively use the function unifiedServer directly
/* that is:
f(a, b) { x(a, b) }

is exactly like calling 'x' directly

with this transitive shortcut, you don't even need to prove the function params since they 'cancel' each other out -- they are
defined above as:
x(a, b) => {
    they are here
}
this *only* works if the unifiedServer is defined *above* this point.  if it is defined below, I believe 'unifiedServer' will be considered 'undefined' and thus nothing will process the request
*/
var serverHttp = http.createServer(unifiedServer);

//start the server have it listen on http port...
serverHttp.listen(config.httpPort, () => {
    console.log(`Listeing on port ${config.httpPort} for env ${config.envName}`);
});

//startr https server...
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

/*var serverHttps = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});*/

//FP modification...
var serverHttps = https.createServer(httpsServerOptions, unifiedServer);

//start the server have it listen on https port...
serverHttps.listen(config.httpsPort, () => {
    console.log(`Listeing on port ${config.httpsPort} for env ${config.envName}`);
});


//this object will hold all our handler logic...
var handlers = {};

//here is a function to handle the 'sample' path...
handlers.sampleHandler = (data, callback) => {
    //callback should send back an http status code + a payload
    callback(406, { "name" : "sampleHandler"});
};

//here is the default handler...
handlers.notFound = (data, callback) => {
    //callback should send back an http status code & no payload required
    callback(404);
};

handlers.ping = (data, callback) => {
    callback(200);
};

//define a request router...
//this is basically a hashmap...
var router = {
    //if the path is "sample", call the sampleHandler...
    'sample': handlers.sampleHandler,
    'ping': handlers.ping
};