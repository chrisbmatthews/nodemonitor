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

//read from a file
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, filename, data, callback) => {
    //open the file for writing...
    //'wx' - open file for writing
    fs.open(lib.baseDir + dir + '/' + filename + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert data to a string...
            let stringData = JSON.stringify(data);
            //first truncate the file...
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
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
                            callback('error writing to existing file');
                        }
                    });
                } else {
                    callback('error truncating file');
                }
            });
        } else {
            //this would be an error...
            callback('could not open file for update, it may not exist');
        }

    });
};

lib.delete = (dir, filename, callback) => {
    //unlink file from fs
    fs.unlink(lib.baseDir + dir + '/' + filename + '.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback("can't delete file");
        }
    });
};

module.exports = lib;