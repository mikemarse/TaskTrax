const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;

function generateAccessToken(email) {
	return (jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {expiresIn: maxAge}));
}

module.exports = generateAccessToken;
