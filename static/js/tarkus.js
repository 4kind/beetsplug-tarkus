let songElements = document.getElementsByClassName('song');
let songsNodeElem = document.getElementById("songs-node-container");
let playlistNodeElem = document.getElementById("playlist-node-container");
let queryInput = document.getElementById("query");
const DEFAULT_PLAYLIST = 'default_playlist';

for (let i = 0; i < songElements.length; i++) {
    /*
        Ensure that on mouseover, CSS styles don't get messed up for active songs.
    */
    songElements[i].addEventListener('mouseover', function () {
        this.style.backgroundColor = '#00A0FF';

        this.querySelectorAll('.song-meta-data .song-title')[0].style.color = '#FFFFFF';
        this.querySelectorAll('.song-meta-data .song-artist')[0].style.color = '#FFFFFF';

        if (!this.classList.contains('amplitude-active-song-container')) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'block';
        }

        this.querySelectorAll('.song-duration')[0].style.color = '#FFFFFF';
    });

    /*
        Ensure that on mouseout, CSS styles don't get messed up for active songs.
    */
    songElements[i].addEventListener('mouseout', function () {
        this.style.backgroundColor = '#FFFFFF';
        this.querySelectorAll('.song-meta-data .song-title')[0].style.color = '#272726';
        this.querySelectorAll('.song-meta-data .song-artist')[0].style.color = '#607D8B';
        this.querySelectorAll('.play-button-container')[0].style.display = 'none';
        this.querySelectorAll('.song-duration')[0].style.color = '#607D8B';
    });
}

Amplitude.init({
    songs: [],
});
Amplitude.addPlaylist(DEFAULT_PLAYLIST, {}, []);

function requestQuery() {

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText)
            let items = response.items;
            songsNodeElem.innerHTML = "";

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                let song = {
                    "track": item.track,
                    "title": item.title,
                    "length": item.length,
                    "original_year": item.original_year,
                    "name": item.title,
                    "artist": item.artist,
                    "albumartist": item.albumartist,
                    "year": item.year,
                    "album": item.album,
                    "album-year": item.album + ' (' + item.original_year + ')',
                    "url": "/item/" + item.id + "/file",
                    "cover_art_url": "/album/" + item.album_id + "/art"
                };

                appendSongToSongsInDom(song, i);
                Amplitude.bindNewElements();
            }
        }
    };
    xhttp.open("GET", "/item/query/" + queryInput.value, true);
    xhttp.send();
}

function appendSongToSongsInDom(item, index) {
    let div_songs_container = document.createElement("DIV");
    div_songs_container.className = "song"

    div_songs_container.addEventListener("click", function (event) {
        appendSongToPlaylistInDom(item, index)
        Amplitude.addSongToPlaylist(item, DEFAULT_PLAYLIST);
    });

    let div_song_meta_data = document.createElement("DIV");
    div_song_meta_data.className = "song-meta-data";

    let span_track = document.createElement("DIV");
    span_track.className = "song-track";
    span_track.innerHTML = item.track;

    let span_title = document.createElement("SPAN");
    span_title.className = "song-title";
    span_title.innerHTML = item.title;

    let span_artist = document.createElement("SPAN");
    span_artist.className = "song-artist";
    span_artist.innerHTML = item.artist;

    let span_album = document.createElement("SPAN");
    span_album.className = "song-album";
    span_album.innerHTML = item.album + ' (' + item.original_year + ')';

    let span_duration = document.createElement("SPAN");
    span_duration.className = "song-duration";
    span_duration.innerHTML = getSongDuration(item);

    div_song_meta_data.appendChild(span_title);
    div_song_meta_data.appendChild(span_artist);
    div_song_meta_data.appendChild(span_album);

    div_songs_container.appendChild(span_track);
    div_songs_container.appendChild(div_song_meta_data);
    div_songs_container.appendChild(span_duration);

    songsNodeElem.appendChild(div_songs_container);
}

function appendSongToPlaylistInDom(item, index) {
    let playlist_index = Amplitude.getSongsInPlaylist(DEFAULT_PLAYLIST).length;

    let div_playlist_song_container = document.createElement("DIV");
    div_playlist_song_container.className = "song amplitude-paused"
    div_playlist_song_container.setAttribute("data-amplitude-song-index", playlist_index);
    div_playlist_song_container.addEventListener("click", function (event) {
        Amplitude.playPlaylistSongAtIndex(playlist_index, DEFAULT_PLAYLIST);

        let elemAct = document.querySelectorAll('#playlist-node-container .song');

        for (let i = 0; i < elemAct.length; i++) {
            if (playlist_index === i) {
                elemAct[i].className = "song amplitude-playing"
            } else {
                elemAct[i].className = "song amplitude-paused"
            }
        }

        let playPauseElem = document.getElementById('play-pause');

        if (Amplitude.getPlayerState() === 'playing') {
            playPauseElem.className = "amplitude-play-pause amplitude-playing";
        } else {
            playPauseElem.className = "amplitude-play-pause amplitude-paused";
        }
    });

    let div_now_playing_container = document.createElement("DIV");
    div_now_playing_container.className = "song-now-playing-icon-container";

    let div_play_button_container = document.createElement("DIV");
    div_play_button_container.className = "play-button-container";

    let img_now_playing = document.createElement("IMG");
    img_now_playing.className = "now-playing";
    img_now_playing.setAttribute("src", "/static/images/now-playing.svg");

    let div_song_meta_data = document.createElement("DIV");
    div_song_meta_data.className = "song-meta-data";

    let span_track = document.createElement("DIV");
    span_track.className = "song-track";
    span_track.innerHTML = playlist_index + 1;

    let span_title = document.createElement("SPAN");
    span_title.className = "song-title";
    span_title.innerHTML = item.title;

    let span_artist = document.createElement("SPAN");
    span_artist.className = "song-artist";
    span_artist.innerHTML = item.artist;

    let span_album = document.createElement("SPAN");
    span_album.className = "song-album";
    div_playlist_song_container
    span_album.innerHTML = item.album + ' (' + item.original_year + ')';

    let span_duration = document.createElement("SPAN");
    span_duration.className = "song-duration";
    span_duration.innerHTML = getSongDuration(item);

    div_song_meta_data.appendChild(span_title);
    div_song_meta_data.appendChild(span_artist);
    div_song_meta_data.appendChild(span_album);

    div_now_playing_container.appendChild(div_play_button_container);
    div_now_playing_container.appendChild(img_now_playing);

    div_playlist_song_container.appendChild(div_now_playing_container);
    div_playlist_song_container.appendChild(span_track);
    div_playlist_song_container.appendChild(div_song_meta_data);
    div_playlist_song_container.appendChild(span_duration);
    playlistNodeElem.appendChild(div_playlist_song_container);
}

function getSongDuration(item) {
    let minutes = Math.floor(item.length / 60).toString();
    let seconds = Math.round(item.length - minutes * 60).toString().padStart(2, '0');

    return minutes + ':' + seconds;
}