async function getUserPlaylists() {
	let args = new URLSearchParams({
		offset: 0,
		limit: 50
	});

	return await spotifyQuery("me/playlists", args)
}

function fetchUserPlaylists() {
	let ulist = document.getElementById("playlist_list");
	ulist.innerHTML == "";
	let spinner = document.createElement("div");
	spinner.classList.add("loader");

	getUserPlaylists()
	.then(data => {
		console.log(data);
		ulist.innerHTML = "";
		plist = data["items"];
		for (let i = 0; i < plist.length; i++) {
			let li = document.createElement("li");

			let li_name = plist[i]["name"];
			let li_len = plist[i]["tracks"]["total"];
			let li_id = plist[i]["id"];

			li.textContent = `${li_name} (${li_len}) - ${li_id}`;
			ulist.appendChild(li);
		}
	})
}
