const generateAccessToken = require("./generateAccessToken");
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
  host: DB_HOST, //localhost IP
  user: DB_USER, // "newuser" was created in the database
  password: DB_PASSWORD, // password for them
  database: DB_DATABASE, // name of the database
  port: DB_PORT, // default port number
});

//connecting to server
db.getConnection((err, connection) => {
  if (err) throw err;
  console.log("DB connected successful: " + connection.threadId);
});

// Other routes and middleware
app.use(express.json());

// Serving static files from "public" directory
app.use(express.static(path.join(__dirname, "/public")));

app.use(
  "dist",
  express.static(path.join(__dirname, "dist"), {
    setHeaders: (res, path, stat) => {
      if (path.endsWith(".css")) {
        res.setHeader("Contant-Type", "text/css");
      }
    },
  })
);

app.get("/users", (req, res) => {
	res.send({data: "here is your data"});
})

//Route to create a user. Checks if user's email exists first, if not creates that user.
app.post("/createUser", async (req, res) => {
  const user = req.body.name;
  const email = req.body.email;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  db.getConnection(async (err, connection) => {
    if (err) throw err;

    const sqlSearch = "SELECT * FROM userTable WHERE email = ?";
    const search_query = mysql.format(sqlSearch, [email]);

    // Inserting the user into the database
    const sqlInsert = "INSERT INTO userTable VALUES (0, ?, ?, ?)";
    const insert_query = mysql.format(sqlInsert, [user, email, hashedPassword]);
    // ? will be replaced by values
    // ?? will be replaced by strings

    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);

      if (result.length !== 0) {
        connection.release();
        console.log("------> Email is already in use");
        res.sendStatus(400);
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("------> Created new User");
          console.log(result.insertId);
          res.sendStatus(201);
        });
      }
    });
  });
});

//Creating the login route. Checks if user's email exists, then compares the passwords. Returns the acccessToken.
app.post("/login", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	db.getConnection(async (err, connection) => {
		if (err) throw (err);

		const sqlSearch = "SELECT * FROM userTable WHERE email = ?";
		const search_query = mysql.format(sqlSearch, [email]);

		await connection.query(search_query, async (err, result) => {
			connection.release();
			if (err) throw (err);
			if (result.length === 0) {
				console.log("------> User does not exist");
				res.sendStatus(404);
			}
			else {
				const hashedPassword = result[0].password;

				if (await bcrypt.compare(password, hashedPassword)) {
					console.log("------> Login successful");
					console.log("------> Generating accessToken");
					const token = generateAccessToken({email: email});
					//console.log(token);
					res.json({accessToken: token});
				}
				else {
					console.log("------> Password is incorrect");
					res.send("Password incorrect!");
				}
			}
		})
	})


})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
