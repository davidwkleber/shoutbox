var redis = require('redis');
var bcrypt = require('bcrypt');

// create long running redis connection
var db = redis.createClient();

// export User function 
module.exports = User;

// User function
function User(obj) {
	//	iterate keys in the obj passed
	for (var key in obj) {
		// merge values
		this[key] = obj[key];
	}
}

User.prototype.save = function(fn) {
	if (this.id) {
		this.update(fn);
	} else {	
		var user = this;
		db.incr('user:ids', function(err, id) {
			if (err) return fn(err);
			user.id = id;
			user.hashPassword(function(err){
				if (err) return fn(err);
				user.update(fn);
			});
		});
	}
};

User.prototype.update = function(fn){
	var user = this;
	var id = user.id;
	db.set('user:id:' + user.name, id, function(err){
		if (err) return fn(err);
		var key = 'user:'+id;
		var userobj = user;
		console.log('key is: ' + key);
		console.log('user is: '+userobj);
		db.hmset(key, user, function(err){
			fn(err);
		});
	});
};

User.prototype.hashPassword = function(fn){
	var user = this;
	console.log('user pass ' +user.pass);
	console.log('salt ' + user.salt);
	bcrypt.genSalt(12, function(err, salt){
		if (err) return fn(err);
		user.salt = salt;
		bcrypt.hash(user.pass, salt, function(err, hash){
			if (err) return fn(err);
			user.pass = hash;
			fn();
		});
	});
};

User.getByName = function(name, fn) {
	User.getId(name, function(err, id) {
		if (err) return fn(err);
		User.get(id, fn);
	});
};

User.getId = function(name, fn) {
	db.get('user:id:' + name, fn);
};

User.get = function(id, fn){
	db.hgetall('user:' +id, function(err, user){
		if (err) return fn(err);
		fn(null, new User(user));
	});
};

User.authenticate = function(name, pass, fn){
	User.getByName(name, function(err, user){
		if (err) return fn(err);
		if (!user.id) return fn();
		bcrypt.hash(pass, user.salt, function(err, hash){
			if (err) return nf(err);
			if (hash == user.pass) return fn(null, user);
			fn();
		});
	});
};

/*

var tobi = new User({
	name: 'Tobi',
	pass: 'im a ferret',
	age: '2'
});

tobi.save(function(err){
	if (err) throw err;
	console.log('user id %d', tobi.id);
});

*/