let password;
let passwordConfirm; 

if (password = document.getElementById("password")){
	const showPassword = document.getElementById("showPassword");
	showPassword.onclick = function() {
		if (password.type === "password") {
			password.type = "text";
			showPassword.innerHTML = "Hide";
		}
		else {
			password.type = "password";
			showPassword.innerHTML = "Show";
		}
	}
}

if (passwordConfirm = document.getElementById("passwordConfirm")) {
	const showConfirm = document.getElementById("showConfirm");
	showConfirm.onclick = function() {
		if (passwordConfirm.type === "password") {
			passwordConfirm.type = "text";
			showConfirm.innerHTML = "Hide";
		}
		else {
			passwordConfirm.type = "password";
			showConfirm.innerHTML = "Show";
		}
	}
}
