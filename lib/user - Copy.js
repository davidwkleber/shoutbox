var redis = require('redis');
var bcrypt = require('bcrypt');
var db = redis.createClient();

module.exports = User;

function User(obj) {
	for (var key in obj) {
		this[key] = obj[key];
	}
}

User.prototype.save = function(fn) {
console.log('save here');
	if (this.id) {
	console.log('id  here');

		this.update(fn);
	} else {
	console.log('new id here');

		var user = this;
		db.incr('user:ids', function(err, id) {
			if (err) return fn(err);
			user.id = id;
			user.hashPassword(function(err) {
							console.log('do update next');

				if (err) return fn(err);
				console.log('do update next');
				user.update(fn);
			});
		});
	}
};

User.prototype.update = function(fn) {
console.log('update here');

	var user = this;
	var id = user.id;
	db.set('user:id:', + user.name, id, function(err) {
		if (err) return fn(err);
		db.hmset('user:', + id, user, function(err) {
			fn(err);
		});
	});
};

User.prototype.hashPassword = function(fn) {
console.log('hashPassword here');

	var user = this;
	bcrypt.genSalt(12, function(err, salt) {
							console.log('genSalt entered ');

		if (err) return fn(err);
		user.salt = salt;
									console.log('genSalt user.salt '+user.salt);

		bcrypt.hash(user.pass, salt, function(err, hash) {
			if (err) return fn(err);
			user.pass = hash;
			console.log('user.pass here ' + user.pass);
		});
						console.log('user.bcrypt done ' + user.pass);

	});
				console.log('user.pass done ' + user.pass);

};

var tobi = new User( {
	name: 'Tobi',
	pass: 'im a ferret',
	age: '2'
});

tobi.save(function(err){
	console.log('user id %d', tobi.id);
	if (err) throw err;
	console.log('user id %d', tobi.id);
});

