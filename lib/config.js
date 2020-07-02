/**
 * Hold enviornment config for the app
 */

//Container for al env settings
var environments = {};

//default env...
environments.staging = {
    "httpPort": 3000,
    "httpsPort": 3443,
    "envName": "staging",
    "hashingSecret": "secret"
};

environments.production = {
    "httpPort": 5000,
    "httpsPort": 5443,
    "envName": "production",
    "hashingSecret": "secret"
};

//determine which env to use, as passed in as NODE_ENV on the command-line (ie: 'NODE_ENV=staging node index.js')
//default to staging if not specified...
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

//select the environment...
var envToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export out to require-er:
module.exports = envToExport;
