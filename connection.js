var mysql = require('mysql');
var util = require('util');


var connection = mysql.createConnection({
    host:'bcobmqq6c4gq7cnwks6o-mysql.services.clever-cloud.com',
    user:'utyxhrnt73swuvwg',
    password:"utyxhrnt73swuvwg",
    database:'bcobmqq6c4gq7cnwks6o'
});

var exe = util.promisify(connection.query).bind(connection);

module.exports = exe;
