var express = require('express');
var session = require('express-session');
var res = express.response;

res.message = function(msg, type) {
	type = type || 'info';
	var sess = this.req.session;
	sess.messages = sess.messages || [];
	sess.messages.push({ type: type, string: msg });
};

res.error = function(msg) {
console.log('res error');
	return this.message(msg, 'error');
};

module.exports = function(req, res, next){
console.log(' called exports');
	res.locals.messages = req.session.messages || [];
	res.locals.removeMessages = function(){
		req.session.messages = [];
	};
	next();
};

