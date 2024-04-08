const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();

const mysql = require("mysql");
const bcrypt = require("bcrypt");

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

const db = mysql.createPool({
	connectionLimit: 100,				
	host: DB_HOST,						//localhost IP
	user: DB_USER,						// "newuser" was created in the database
	password: DB_PASSWORD,		// password for them
	database: DB_DATABASE,		// name of the database
	port: DB_PORT							// default port number
})

//connecting to server
db.getConnection((err, connection) => {
	if (err) throw (err);
	console.log("DB connected successful: " + connection.threadId);
})

// Serving static files from "public" directory
app.use(express.static(path.join(__dirname, '/public')));

app.use('dist', express.static(path.join(__dirname, 'dist'), {
	setHeaders: (res, path, stat) => {
		if (path.endsWith('.css')) {
			res.setHeader('Contant-Type', 'text/css');
		}
	}
}));

// Other routes and middleware
app.use(express.json());

app.post("/createUser", async(req, res) => {
	const salt = bcrypt.genSalt(11);

	const user = req.body.name;
	const email = req.body.email;
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	db.getConnection(async (err, connection) => {
		if (err) throw (err);
		// Searching for the user. Might change this to email... who knows
		const sqlSearch = "SELECT * FROM userTable WHERE user = ?";
		const search_query = mysql.format(sqlSearch, [user]);

		// Inserting the user into the database 
		const sqlInsert = "INSERT INTO userTable VALUES (0, ?, ?, ?)";
		const insert_query = mysql.format(sqlInsert, [user, email, hashedPassword]);
		// ? will be replaced by values
		// ?? will be replaced by strings

		await connection.query(search_query, async(err, result) => {
			if (err) throw (err);
			console.log("------> Search Results");
			console.log(result.length);

			if (result.length !== 0) {
				connection.release();
				console.log("------> User already exists");
				res.sendStatus(400);
			}
			else {
				await connection.query(insert_query, (err, result) => {
					connection.release();
					if (err) throw (err);
					console.log("------> Created new User");
					console.log(result.insertId);
					res.sendStatus(201);
				})
			}
		})
	})
})


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
