let password;
let passwordConfirm; 
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

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

if (registerForm != null) {
	registerForm.addEventListener('submit', async(event) => {
		event.preventDefault();
		const formData = new FormData(registerForm);

		const email = document.getElementById('email').value;
		const name = document.getElementById('name').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('passwordConfirm').value;

		const requestBody = {
			name: name,
			email: email,
			password: password,
			passwordConfirm: passwordConfirm
		}

		try {
			const response = await fetch('/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			const data = await response.json();

			if (response.ok) {
				console.log("EMAIL IS: " + email);
				localStorage.setItem("UserEmail", email);
				
				//redirect to calendar with access token
				window.location.href = data.redirectTo;
			}
			else {
				const errorMessage = document.getElementById('errorMessageRegister')
				errorMessage.textContent = data.message;
			}
		}
		catch (error) {
			console.log(error);
		}
	});
}

if (loginForm !== null) {
	loginForm.addEventListener('submit', async(event) => {
		event.preventDefault();
		const formData = new FormData(loginForm);

		// Get email and password fields from the form
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		// Construct the request body as a JavaScript object
		const requestBody = {
			email: email,
			password: password
		};

		try {
			const response = await fetch('/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json' // Specify JSON content type
				},
				body: JSON.stringify(requestBody)
			});

			// Parse JSON response
			const data = await response.json();

			if (response.ok) {
				//redirecting to calendar page
				// This will handle the access token uncomment when we figure out what to do with it
				//localStorage.setItem('accessToken', data.accessToken)
				console.log("EMAIL IS: " + email);
				localStorage.setItem("UserEmail", email);
				
				window.location.href = data.redirectTo;
			}
			else {
				const errorMessage = document.getElementById("errorMessage");
				errorMessage.innerHTML = data.message;
			}
		}
		catch (error) {
			console.error(error)
		}
	});
}
