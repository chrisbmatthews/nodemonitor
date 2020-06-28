/*
 Primary file for the api
 */

 //deps
 //for http server
 const http = require('http');
 //for parsing the url
 const url = require('url');
 //for parsing payload from request
 const StringDecoder = require('string_decoder').StringDecoder;
 //get config...
 const config = require('./config'); //this is the envToExport from that file...

//server should respond to all requests with a string
var server = http.createServer((req, res) => {
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

});

//start the server have it listen on 3000
server.listen(config.port, () => {
    console.log(`Listeing on port ${config.port} for env ${config.envName}`);
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

//define a request router...
//this is basically a hashmap...
var router = {
    //if the path is "sample", call the sampleHandler...
    "sample": handlers.sampleHandler
};