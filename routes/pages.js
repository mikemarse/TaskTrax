const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/calendar", (req, res) => {
	res.render("calendar");
});

/*router.get("/register", (req, res) => {
	res.render("register");
});*/

router.use('/register', express.static('register'));

module.exports = router;
