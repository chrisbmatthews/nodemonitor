const dataLib = require('./data');
const helpers = require('./helpers');

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
        //first ensure the user doesn't exist...
        dataLib.read("users", phone, (err, data) => {
            if (err) {
                //an error is good in this case; the user doesn't exist yet...
                //has the password...
                let hashPassword = helpers.hash(password);
                if (hashPassword) {
                    let user = {
                        "firstName" : firstName,
                        "lastName" : lastName,
                        "phone" : phone,
                        "hashPassword" : hashPassword,
                        "tosAgreement" : tosAgreement
                    };
                    dataLib.create("users", phone, user, (err, data) => {
                        if (err) {
                            callback(500, {"internal server error" : err});
                        } else {
                            //all good!
                            callback(200);
                        }
                    });
                } else {
                    callback(500, {"Error" : "couldn't hash password"});
                }
            } else {
                //the user already exsts...
                callback(400, {"user already exists:": phone});
            }
        });
    } else {
        //invalid
        callback(400, {"Error": "validation failed"});
    }
};

/**
 * Users get
 * required data: phone
 * optional: none
 * @todo: only let authenticated users access their own user data
 */
handlers._users.get = (data, callback) => {
    //check that the phone number is valid
    let phone = typeof(data.urlQuery.phone) == 'string' && data.urlQuery.phone.trim().length == 10 ? data.urlQuery.phone.trim() : false;
    if (phone) {
        dataLib.read("users", phone, (err, data) => {
            if (!err && data) {
                //remove hashed password form the user before returning it to the requestor
                delete data.hashPassword;
                callback(200, data);
            } else {
                callback(404, {"Error" : "Not found " + phone});
            }

        });
    } else {
        callback(400, {"Error" : "missing required field"});
    }
};

/**
 * Users get
 * required data: phone
 * optional: firstName, lastName, password
 * @todo: only let authenticated users update their own user data
 */
handlers._users.put = (data, callback) => {
    //check that the phone number is valid
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone && (firstName || lastName || password)) {
        dataLib.read("users", phone, (err, data) => {
            if (!err && data) {
                //got him, let's update him...
                if (firstName) {
                    data.firstName = firstName;
                }
                if (lastName) {
                    data.lastName = lastName;
                }
                if (password) {
                    data.hashPassword = helpers.hash(password);
                }
                dataLib.update("users", phone, data, (err) => {
                    if (!err) {
                        delete data.hashPassword;
                        callback(200, data);
                    } else {
                        callback(500, {"Internal server error" : err});
                    }
                });
            } else {
                callback(404, {"Error" : "Not found " + phone});
            }

        });
    } else {
        callback(400, {"Error" : "missing required field"});
    }
};

/**
 * Users delete
 * required data: phone
 * optional: none
 * @todo: only let authenticated users update their own user data
 */
handlers._users.delete = (data, callback) => {
    //check that the phone number is valid
    let phone = typeof(data.urlQuery.phone) == 'string' && data.urlQuery.phone.trim().length == 10 ? data.urlQuery.phone.trim() : false;
    if (phone) {
        dataLib.delete("users", phone, (err) => {
            if (!err) {
                callback(200);
            } else {
                callback(5005, {"Internal Server Error" : err});
            }

        });
    } else {
        callback(400, {"Error" : "missing required field"});
    }
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