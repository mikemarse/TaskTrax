const express = require("express");
const path = require("path");
const router = express.Router();

//router.use(express.static(__dirname + "/public/calendar.html"));;

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/calendar", (req, res) => {
	res.sendFile("/Users/mike/TaskTrax/public/calendar.html");
});

router.get("/register", (req, res) => {
	res.sendFile("/Users/mike/TaskTrax/public/register.html");
});

//router.use('/register', express.static('register'));

module.exports = router;
