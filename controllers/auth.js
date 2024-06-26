const mysql = require("mysql2");
const generateAccessToken = require("../generateAccessToken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const express = require("express");
const app = express();

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
	multipleStatements: true,
});

const maxAge = 3 * 24 * 60 * 60;

//Route to create a user. Checks if user's email exists first, if not creates that user.
exports.register = async (req, res) => {
  const user = req.body.name;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
	const passwordConfirm = req.body.passwordConfirm;
	console.log("Reaching register")

	db.getConnection(async (err, connection) => {
		if (err) {
			console.error('Error connecting to MySQL database: ' + err.stack);
			return;
		}


    const sqlSearch = "SELECT * FROM userTable WHERE email = ?";
    const search_query = mysql.format(sqlSearch, [email]);

    // Inserting the user into the database
    const sqlInsert = "INSERT INTO userTable VALUES (0, ?, ?, ?)";
    const insert_query = mysql.format(sqlInsert, [user, email, hashedPassword]);
    // ? will be replaced by values
    // ?? will be replaced by strings

    connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log("------> Email is already in use");
				res.status(404).json({ user: "", redirectTo: "/register", message: "Email is already in use"});
      } 
			else if (req.body.password !== passwordConfirm) {
				connection.release();
				console.log("Passwords do not match ")
				res.status(404).json({ user: "", redirectTo: "/register", message: "Passwords do not match"});
			}
			else {
        connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("------> Created new User");
          console.log(result.insertId);
					const token = generateAccessToken({ email: email });

																			// Change to secure: true
					res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
					//console.log(`${user}'s token is: ${token}`);
					res.json({ user: email, redirectTo: "/calendar", message: ""});
        });
      }
    });
  });
};

//Creating the login route. Checks if user's email exists, then compares the passwords. Returns the acccessToken.
exports.login = (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	db.getConnection(async (err, connection) => {
		if (err) {
			console.error('Error connecting to MySQL database: ' + err.stack);
			return;
		}

		const sqlSearch = "SELECT * FROM userTable WHERE email = ?";
		const search_query = mysql.format(sqlSearch, [email]);

		/*await*/ connection.query(search_query, async (err, result) => {
			connection.release();
			if (err) throw (err);
			if (result.length === 0) {
				console.log("------> User does not exist");
				//res.sendStatus(404);
				res.status(404).json({ user: "", redirectTo: "/", message: "Invalid email or password"});

				// USING A TEMPLATE ENGINE YOU CAN DO THIS
				/*return res.render('/index', {
					message: 'Incorrect email or password'
				});*/
			}
			else {
				const hashedPassword = result[0].password;

				// If password is correct
				if (await bcrypt.compare(password, hashedPassword)) {
					console.log("------> Login successful");
					console.log("------> Generating accessToken");
					const token = generateAccessToken({email: email});
					console.log(`${result[0].userID}'s token is: ${token}`);
																		// Change to secure: true
					res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
					res.json({user: result[0].userID, redirectTo: "/calendar", message: ""});
					// Gonna render the calendar page here after login! ------------
				}
				else { // Password is incorrect
					console.log("------> Password is incorrect");
					//res.send("Password incorrect!");
					res.status(404).json({ user: "", redirectTo: "/", message: "Invalid email or password"})
					/*return res.render('/', {
						message: 'Incorrect email or password' // need a templating engine to be able to render this. Gotta figure out which one to use.
					});*/
				}
			}
		})
	})
}
