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

		window.open(url);
	})
}


function checkSpotifyAccess() {
	const urlParams = new URLSearchParams(window.location.search);
	let code = urlParams.get("code");

	if (code == null) {
		return false
	} else {
		let codeVerifier = localStorage.getItem("code_verifier");

		let body = new URLSearchParams({
			grant_type: "authorization_code",
			code: code,
			redirect_uri: redirectUri,
			client_id: clientId,
			code_verifier: codeVerifier
		});

		requestSpotifyAccessCode(body);
		return true
	}
}


async function requestSpotifyAccessCode(body) {
	const response = await fetch("https://accounts.spotify.com/api/token", {
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
		localStorage.setItem('access_token', data.access_token);
	})
	.catch(error => {
		console.error("Error:", error);
	});
}


async function spotifyQuery(queryString, args=null) {
	let accessToken = localStorage.getItem('access_token');
	console.log(String(args));

	let url = `https://api.spotify.com/v1/${queryString}`;
	if (args != null) {
		url += `?${args}`;
	};

	const response = await fetch(url, {
		headers: {
			Authorization: 'Bearer ' + accessToken
		}
	});

	const data = await response.json();
	return data;
}


async function spotifyQueryAll(queryString, args=null) {
	var output_items = [];

	let accessToken = localStorage.getItem('access_token');
	console.log(String(args));

	let url = `https://api.spotify.com/v1/${queryString}`;
	if (args != null) {
		url += `?${args}`;
	};

	while (url != null) {
		console.log(url);
		const response = await fetch(url, {
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		});

		const data = await response.json();
		output_items = output_items.concat(data["items"]);
		url = data["next"];
	}

	return output_items;
}


async function testQueryButton() {
	await spotifyGetAccessCode();
	let userData = await spotifyQuery("me");
	console.log(userData);
}