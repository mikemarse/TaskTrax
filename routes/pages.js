const express = require("express");
const path = require("path");
const router = express.Router();

//console.log(__dirname + "/../public/calendar.html");
//router.use(express.static(__dirname + "/public/calendar.html"));;

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/calendar", (req, res) => {
	res.sendFile(path.join(__dirname, '../public/caltest.html'));
});

router.get("/register", (req, res) => {
	res.sendFile(path.join(__dirname, '../public/register.html'));
});

//router.use('/register', express.static('register'));

module.exports = router;
