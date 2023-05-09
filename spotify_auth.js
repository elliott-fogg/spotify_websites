function generateRandomString(length) {
	let text = '';
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}


async function generateCodeChallenge(codeVerifier) {
	function base64encode(string) {
		return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	}

	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const digest = await window.crypto.subtle.digest('SHA-256', data);

	return base64encode(digest);
}


const clientId = '0f101924c51c434f831b7864e1b54484';
const redirectUri = "https://elliott-fogg.github.io/spotify_websites/playlist_dashboard.html";


function getSpotifyAuthorization() {
	let codeVerifier = generateRandomString(128);

	generateCodeChallenge(codeVerifier)
	.then(codeChallenge => {
		let state = generateRandomString(16);
		let scope = 'user-read-private user-read-email playlist-read-private';

		localStorage.setItem('code_verifier', codeVerifier);

		let args = new URLSearchParams({
			response_type: "code",
			client_id: clientId,
			scope: scope,
			redirect_uri: redirectUri,
			state: state,
			code_challenge_method: 'S256',
			code_challenge: codeChallenge
		});

		let url = "https://accounts.spotify.com/authorize?" + args;
		console.log(url);

		window.location.replace(url);
	})
}


function checkSpotifyAccess() {
	// Get login button for later use
	var login_button = document.getElementById("login_btn");

	// Check for locally stored access code (that hasn't expired)
	let access_token = localStorage.getItem('access_token');
	let access_token_timestamp = parseInt(localStorage.getItem("access_token_timestamp"));
	let access_token_duration = parseInt(localStorage.getItem("access_token_duration"));
	let date = new Date();

	if (access_token != null) {
		if ((access_token_timestamp + access_token_duration) > date.getTime()) {
			updateLoginButton();
			return;
		}
	}

	// Check for response code in the page url (we've just been redirected)
	const urlParams = new URLSearchParams(window.location.search);
	let code = urlParams.get("code");

	console.log(code);

	if (code != null) {
		console.log("CODE IS NOT NULL");
		// Response code exists, request access code, then remove
		login_button.disabled = true;
		requestSpotifyAccessCode(code);
		window.history.replaceState({}, "", redirectUri);
		return;
	}

	// At this point, the user is not logged in
	login_button.onclick = getSpotifyAuthorization;
	login_button.disabled = false;

	// Check for existing access code (not out of date)
		// If yes, load username and logout button

		// If no, create login button
		// Check for code in URL
			// If yes, disable login button
			// Request access code
			// Remove URL
			// On reception of access code, replace login button with username and logout button
}


async function requestSpotifyAccessCode(response_code) {
	let codeVerifier = localStorage.getItem("code_verifier");

	let body = new URLSearchParams({
		grant_type: "authorization_code",
		code: response_code,
		redirect_uri: redirectUri,
		client_id: clientId,
		code_verifier: codeVerifier
	});

	fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('HTTP status ' + response.status);
		}
		return response.json();
	})
	.then(data => {
		let date = new Date();
		localStorage.setItem('access_token', data.access_token);
		localStorage.setItem('access_token_timestamp', date.getTime());
		localStorage.setItem('access_token_duration', data.expires_in);
		localStorage.setItem('test', JSON.stringify(data));
		updateLoginButton();
	})
	.catch(error => {
		console.error("Error:", error);
	});
}


async function updateLoginButton() {
	let userData = await spotifyQuery("me");
	localStorage.setItem("test", JSON.stringify(userData));

	let login_div = document.getElementById("login_div");
	login_div.innerHTML = "";

	let username = document.createElement("label");
	username.textContent = "WIP";
	login_div.appendChild(username);

	let logout_btn = document.createElement("button");
	logout_btn.textContent = "Log Out";
	logout_btn.onclick = () => {console.log("Log out")};
	login_div.appendChild(logout_btn);

	document.getElementById("fetchPlaylistBtn").disabled = false;
}


async function query(queryURL) {
	let accessToken = localStorage.getItem("access_token");
	const response = await fetch(queryURL, {
		headers: {
			Authorization: 'Bearer ' + accessToken
		}
	});

	const data = await response.json();
	return data;
}


async function queryAll(queryURL) {
	let nextURL = queryURL;
	let output_items = [];

	console.log(`Initiating next query - ${nextURL}`);

	while (nextURL != null) {
		let data = await query(queryURL);
		output_items = output_items.concat(data["items"]);
		nextURL = data["next"];
	}
	return output_items;
}


async function spotifyQuery(queryString, args=null, all=true) {
	let url = `https://api.spotify.com/v1/${queryString}`;
	if (args != null) {
		url += `?${args}`;
	}

	let queryFunc;
	if (all) {
		queryFunc = queryAll;
	} else {
		queryFunc = query;
	}

	let data = await queryFunc(url);
	return data;
}


async function testQueryButton() {
	await spotifyGetAccessCode();
	let userData = await spotifyQuery("me");
	console.log(userData);
}