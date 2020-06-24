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

        //send the response
        res.end('Hello World\n');

        //log the path from the request
        console.log('Received request on ' + trimmedPath + " with method: " + method + " with query: ", urlQuery);
        console.log('Headers: ', headers);

        console.log("Payload was: ", buffer);
    });

});

//start the server have it listen on 3000
server.listen(3000, () => {
    console.log('Listeing on port 3000');
});