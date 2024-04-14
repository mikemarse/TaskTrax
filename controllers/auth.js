const mysql = require("mysql");
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
});

//Route to create a user. Checks if user's email exists first, if not creates that user.
exports.register = async (req, res) => {
  const user = req.body.name;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
	const passwordConfirm = req.body.passwordConfirm;

  db.getConnection(async (err, connection) => {
    if (err) throw err;

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
        res.sendStatus(400);
      } 
			else if (req.body.password !== passwordConfirm) {
				connection.release();
				console.log("Passwords do not match ")
				return res.redirect("/register");
			}
			else {
        connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("------> Created new User");
          console.log(result.insertId);
          res.redirect("/calendar");
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

				// If password is correct
				if (await bcrypt.compare(password, hashedPassword)) {
					console.log("------> Login successful");
					console.log("------> Generating accessToken");
					const token = generateAccessToken({email: email});
					console.log(`${result[0].user}'s token is: ${token}`);
					//res.send(`${result[0].user} is now logged in!`);
					res.redirect("/calendar"); // Rendering new calendar page after login
					//res.json({accessToken: token});
					// Gonna render the calendar page here after login! ------------
				}
				else { // Password is incorrect
					console.log("------> Password is incorrect");
					res.send("Password incorrect!");
					return res.render('/', {
						message: 'Incorrect email or password' // need a templating engine to be able to render this. Gotta figure out which one to use.
					});
				}
			}
		})
	})
} 
