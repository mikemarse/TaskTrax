const mysql = require("mysql");
const generateAccessToken = require("../generateAccessToken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST, //localhost IP
  user: DB_USER, // "newuser" was created in the database
  password: DB_PASSWORD, // password for them
  database: DB_DATABASE, // name of the database
  port: DB_PORT, // default port number
});

exports.register = (req, res) => {
	console.log(req.body);
	res.send("Form submitted");
}

//Creating the login route. Checks if user's email exists, then compares the passwords. Returns the acccessToken.
exports.login =(req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	db.getConnection(async (err, connection) => {
		if (err) throw (err);

		const sqlSearch = "SELECT * FROM userTable WHERE email = ?";
		const search_query = mysql.format(sqlSearch, [email]);

		/*await*/ connection.query(search_query, async (err, result) => {
			connection.release();
			if (err) throw (err);
			if (result.length === 0) {
				console.log("------> User does not exist");
				res.sendStatus(404);
				return res.render('/index', {
					message: 'Incorrect email or password'
				});
			}
			else {
				const hashedPassword = result[0].password;

				if (await bcrypt.compare(password, hashedPassword)) {
					console.log("------> Login successful");
					console.log("------> Generating accessToken");
					const token = generateAccessToken({email: email});
					console.log(`${result[0].user}'s token is: ${token}`);
					res.send(`${result[0].user} is now logged in!`)
					//res.json({accessToken: token});
				}
				else {
					console.log("------> Password is incorrect");
					res.send("Password incorrect!");
					return res.render('/index', {
						message: 'Incorrect email or password' // need a templating engine to be able to render this. Gotta figure out which one to use.
					});
				}
			}
		})
	})
} 
