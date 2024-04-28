const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
	const token = req.cookies.jwt;

	//check if json web token exists and is verified
	
	if (token) {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.redirect("/");
			}
			else {
				console.log(decodedToken);
				// Might need to just say redirect("/calendar") if this doesn't work
				next();
			}
		});
	}
	else {
		console.log("It did not work");
		res.redirect("/");
	}
}

module.exports = { requireAuth };
