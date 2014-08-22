var User = require('../lib/user');
var session = require('express-session');


exports.form = function(req, res){
	res.render('register', { title: 'Register' });
};

exports.submit = function(req, res, next){

	var data = req.body.user;
	User.getByName(data.name, function(err, user) {
		if (err) return next(err);
		
		if (user.id) {
			res.error("Username already taken!");
			res.redirect('back');
		} else {
		console.log('user info '+req.body.user.name+ ' ' +req.body.user.pass);
			user = new User({
				name: data.name,
				pass: data.pass
			});
			
			user.save(function(err){
				if (err) return next(err);
				req.session.uid = user.id;
				res.redirect('/');
			});
		}
	});
};
