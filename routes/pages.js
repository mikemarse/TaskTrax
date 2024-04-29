const express = require("express");
const path = require("path");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

//console.log(__dirname + "/../public/calendar.html");
//router.use(express.static(__dirname + "/public/calendar.html"));;

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/calendar", requireAuth, (req, res) => {
	res.sendFile(path.join(__dirname, '../public/calendar.html'));
});

router.get("/register", (req, res) => {
	res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.get("/administrator", requireAuth, (req, res) => {
	res.sendFile(path.join(__dirname, '../public/administrator.html'));
});

router.get("/logout", (req, res) => {
	res.cookie("jwt", '', { maxAge: 1 });
	res.redirect('/');
});

//exports.logout = (req, res) => {
//	res.cookie("jwt", '', { maxAge: 1 });
//	res.redirect('/');
//}

//router.use('/register', express.static('register'));

module.exports = router;
