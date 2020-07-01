//this object will hold all our handler logic...
let handlers = {};

/*const usersPost = (data, callback) => {
    console.log('HELLO ', data.method);
    callback(200);
};

const usersGet = usersPost;
const usersDelete = usersPost;
const usersPut = usersPost;

//'private methods' for users handlers
handlers._users = {
    'post': usersPost,
    'get': usersGet,
    'put': usersGet,
    'delete': usersDelete
};*/

//better notation for private users methods:
handlers._users = {};

//required data will be: firstName, lastName, phone, password, tosAgreement:boolean
//optional data: none
handlers._users.post = (data, callback) => {
    //check for required fields...
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' ? data.payload.tosAgreement : false;
    if (firstName && lastName && phone && password && tosAgreement) {
        //valid...
        callback(200);
    } else {
        //invalid
        callback(406);
    }
};

handlers._users.get = (data, callback) => {
    callback(200);
};

handlers._users.put = (data, callback) => {
    callback(200);
};

handlers._users.delete = (data, callback) => {
    callback(200);
};

handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        //k, we have one of our good http methods...
        //call a *subhandler* for this particular method...
        handlers._users[data.method](data, callback);
    } else {
        //405 = method not allowed
        callback(405);
    }
};


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

module.exports = handlers;