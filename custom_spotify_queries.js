async function getUserPlaylists() {
	let args = new URLSearchParams({
		offset: 0,
		limit: 50
	});

	spotifyQuery("me/playlists", args)
	.then()
}

function fetchUserPlaylists() {
	let ulist = document.getElementById("playlist_list");
	ulist.innerHTML == "";
	let spinner = document.createElement("div");
	spinner.classList.add("loader");

	getUserPlaylists()
	.then(data => {
		console.log(data);
		ulist.innerHTML = "Complete!";
	})
}
