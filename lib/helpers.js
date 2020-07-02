const crypto = require('crypto');
const config = require('./config'); //this is the envToExport from that file...
//util functions

let helpers = {};

helpers.hash = (toHash) => {
    //sha256 is the hash
    if (typeof(toHash) == 'string' && toHash.trim().length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret).update(toHash).digest('hex');
    } else {
        return false;
    }
};

//safely parse JSON
helpers.jsonToObject = (toConvert) => {
    try {
        return JSON.parse(toConvert);
    } catch (e) {
        return {};
    }
};

module.exports = helpers;