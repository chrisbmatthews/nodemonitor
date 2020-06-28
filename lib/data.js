/**
 * lib for storing & editing data
 */
let fs = require('fs');
let path = require('path');

//container for the module:
let lib = {};

//base directory of .data directory
//normalized our current directoyr (__dirname) and backs up a dir and enters .data
//result is a full qualifiied directory location
lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (dir, filename, data, callback) => {
    //open the file for writing...
    //'wx' - open file for writing
    fs.open(lib.baseDir + dir + '/' + filename + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to a string...
            let stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false); //returning false means no error
                        } else {
                            callback('error closing file');
                        }
                    })

                } else {
                    callback('error writing to new file');
                }
            });
        } else {
            //this would be an error...
            callback('could not create new file, it may already exist');
        }

    });
};

module.exports = lib;