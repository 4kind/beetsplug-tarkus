let songsNodeElem = document.getElementById("songs-node-container");
let queryInput = document.getElementById("query");
let songsToAdd = [];

Amplitude.init({
    "songs": []
});

/*
  Shows the playlist
*/
document.getElementsByClassName('show-playlist')[0].addEventListener('click', function () {
    document.getElementById('white-player-playlist-container').classList.remove('slide-out-top');
    document.getElementById('white-player-playlist-container').classList.add('slide-in-top');
    document.getElementById('white-player-playlist-container').style.display = "block";
});

/*
  Hides the playlist
*/
document.getElementsByClassName('close-playlist')[0].addEventListener('click', function () {
    document.getElementById('white-player-playlist-container').classList.remove('slide-in-top');
    document.getElementById('white-player-playlist-container').classList.add('slide-out-top');
    document.getElementById('white-player-playlist-container').style.display = "none";
});

function addToPlaylistEvent(element) {
    element.addEventListener('click', function () {
        /*
          Adds the song to Amplitude, appends the song to the display,
          then rebinds all of the AmplitudeJS elements.
        */
        let songToAddIndex = this.getAttribute('song-to-add');
        let newIndex = Amplitude.addSong(songsToAdd[songToAddIndex]);

        appendToSongDisplay(songsToAdd[songToAddIndex], newIndex);
        Amplitude.bindNewElements();

        const isFirstSong = Amplitude.getSongs().length === 1;
        if (isFirstSong) {
            document.getElementById('next').click();
        }
    });
}

/*
  Appends the song to the display.
*/
function appendToSongDisplay(song, index) {
    /*
      Grabs the playlist element we will be appending to.
    */
    let playlistElement = document.querySelector('.white-player-playlist');

    /*
      Creates the playlist song element
    */
    let playlistSong = document.createElement('div');
    playlistSong.setAttribute('class', 'white-player-playlist-song amplitude-song-container amplitude-play-pause');
    playlistSong.setAttribute('data-amplitude-song-index', index);

    /*
      Creates the playlist song image element
    */
    let playlistSongImg = document.createElement('img');
    playlistSongImg.setAttribute('src', song.cover_art_url);

    /*
      Creates the playlist song meta element
    */
    let playlistSongMeta = document.createElement('div');
    playlistSongMeta.setAttribute('class', 'playlist-song-meta');

    /*
      Creates the playlist song name element
    */
    let playlistSongName = document.createElement('span');
    playlistSongName.setAttribute('class', 'playlist-song-name');
    playlistSongName.innerHTML = song.name;

    /*
      Creates the playlist song artist album element
    */
    let playlistSongArtistAlbum = document.createElement('span');
    playlistSongArtistAlbum.setAttribute('class', 'playlist-song-artist');
    playlistSongArtistAlbum.innerHTML = song.artist + ' &bull; ' + song.album;

    /*
      Appends the name and artist album to the playlist song meta.
    */
    playlistSongMeta.appendChild(playlistSongName);
    playlistSongMeta.appendChild(playlistSongArtistAlbum);

    /*
      Appends the song image and meta to the song element
    */
    playlistSong.appendChild(playlistSongImg);
    playlistSong.appendChild(playlistSongMeta);

    /*
      Appends the song element to the playlist
    */
    playlistElement.appendChild(playlistSong);
}

document.getElementById('queryBtn').addEventListener('click', function () {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText)
            let items = response.items;

            document.getElementById('songs-node-container').innerHTML = '';

            let albumId = null;
            let countSongs = 0;
            let img = null;

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                let song = {
                    "track": item.track,
                    "title": item.title,
                    "length": item.length,
                    "original_year": item.original_year,
                    "name": item.title,
                    "artist": item.artist,
                    "mb_artistid": item.mb_artistid,
                    "mb_albumid": item.mb_albumid,
                    "mb_albumartistid": item.mb_albumartistid,
                    "albumartist": item.albumartist,
                    "year": item.year,
                    "album": item.album,
                    "album-year": item.album + ' (' + item.original_year + ')',
                    "url": "/item/" + item.id + "/file",
                    "cover_art_url": "/album/" + item.album_id + "/art"
                };

                songsToAdd.push(song);

                let row = document.createElement('tr');
                row.className = 'song-to-add';
                row.setAttribute('song-to-add', i);

                if (albumId !== item.album_id) {
                    if (i > 0 && img) {
                        setRowspan(img, countSongs);
                        countSongs = 1;
                    }

                    albumId = item.album_id;

                    let td_image = document.createElement('td');

                    img = document.createElement('img');
                    img.setAttribute("src", song.cover_art_url);
                    td_image.appendChild(img);
                    row.appendChild(td_image);
                } else if (i === (items.length - 1) && img) {
                    setRowspan(img, countSongs);
                }

                countSongs++;

                let td_song_title = document.createElement('td');

                let a_add = document.createElement('a');
                a_add.innerHTML = item.title;
                a_add.className = 'add-to-playlist-button'
                a_add.setAttribute('song-to-add', i);

                addToPlaylistEvent(a_add);

                td_song_title.appendChild(a_add);

                row.appendChild(td_song_title);

                songsNodeElem.appendChild(row);
            }
        }
    };
    xhttp.open("GET", "/item/query/" + queryInput.value, true);
    xhttp.send();
});

function setRowspan(img, rowspan) {
    img.parentElement.setAttribute('rowspan', rowspan);
}

// Execute a function when the user releases a key on the keyboard
queryInput.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.key === 'Enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("queryBtn").click();
    }
});