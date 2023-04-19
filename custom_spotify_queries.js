async function getUserPlaylists() {
	let args = new URLSearchParams({
		offset: 0,
		limit: 50
	});

	return await spotifyQueryAll("me/playlists", args)
}


function fetchUserPlaylists() {
	let ulist = document.getElementById("playlist_display");
	ulist.innerHTML == "";
	let spinner = document.createElement("div");
	spinner.classList.add("loader");
	ulist.appendChild(spinner);

	loadUserPlaylists();
}


async function loadUserPlaylists() {
	getUserPlaylists()
	.then(plist => sortAndLoadPlaylists(plist));
}


function sortAndLoadPlaylists(playlist_list) {
	let d = document.getElementById("playlist_display");
	let user_playlists = [];
	let other_playlists = [];

	for (let i = 0; i < playlist_list.length; i++) {
		let plist = playlist_list[i];
		let name = plist["name"];
		let track_num = plist["tracks"]["total"];
		let plist_id = plist["id"];
		let author = plist["owner"]["display_name"];

		let li = document.createElement("li");
		li.textContent = `${name} >> ${author} (${track_num})`;
		user_playlists.appendChild(li);
	}

	d.innerHTML = "";
	let user_ul = document.createElement("ul");
	for (let i = 0; i < user_playlists.length; i++) {
		user_ul.appendChild(user_playlists[i]);
	}
	d.appendChild(user_ul);
}