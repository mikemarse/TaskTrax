const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();

const mysql = require("mysql")

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



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
