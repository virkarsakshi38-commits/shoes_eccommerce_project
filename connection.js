var mysql = require('mysql');
var util = require('util');


var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:"",
    database:'a2z_shoes_ecom'
});

var exe = util.promisify(connection.query).bind(connection);

module.exports = exe;