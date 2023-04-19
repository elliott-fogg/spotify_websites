async function getUserPlaylists() {
	let args = new URLSearchParams({
		offset: 0,
		limit: 50
	});

	let playlistData = await spotifyQuery("me/playlists", args);
}