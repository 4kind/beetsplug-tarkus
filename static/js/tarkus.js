let songElements = document.getElementsByClassName('song');
let playlistNodeElem = document.getElementById("playlist-node-container");
let queryInput = document.getElementById("query");

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

    /*
        Show and hide the play button container on the song when the song is clicked.
    */
    songElements[i].addEventListener('click', function () {
        this.querySelectorAll('.play-button-container')[0].style.display = 'none';
    });
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

Amplitude.init({
    "songs": []
});

function requestQuery() {

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText)
            let items = response.items || response.results;
            let songs = [];

            playlistNodeElem.innerHTML = "";

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                appendSongToPlaylistInDom(item, i);

                    Amplitude.pause();

                songs.push(
                    {
                        "name": item.title,
                        "artist": item.artist,
                        "album": item.album,
                        "url": "/item/" + item.id + "/file",
                        "cover_art_url": "/album/" + item.album_id + "/art"
                    }
                );

                Amplitude.addSong({
                        "name": item.title,
                        "artist": item.artist,
                        "album": item.album,
                        "url": "/item/" + item.id + "/file",
                        "cover_art_url": "/album/" + item.album_id + "/art"
                    });
            }

            Amplitude.init({
                "songs": songs
            });
        }
    };
    xhttp.open("GET", "/item/query/" + queryInput.value, true);
    xhttp.send();
}

function appendSongToPlaylistInDom(item, index) {
    let div_1 = document.createElement("DIV");
    div_1.className = "song amplitude-song-container amplitude-play-pause"
    div_1.setAttribute("data-amplitude-song-index", index);

    let div_1_1 = document.createElement("DIV");
    div_1_1.className = "song-now-playing-icon-container";

    let div_1_1_1 = document.createElement("DIV");
    div_1_1_1.className = "play-button-container";

    let img_1_1_2 = document.createElement("IMG");
    img_1_1_2.className = "now-playing";
    img_1_1_2.setAttribute("src", "/static/images/now-playing.svg");

    let div_1_2 = document.createElement("DIV");
    div_1_2.className = "song-meta-data";

    let span_1_2_1 = document.createElement("SPAN");
    span_1_2_1.className = "song-title";
    span_1_2_1.innerHTML = item.title;

    let span_1_2_2 = document.createElement("SPAN");
    span_1_2_2.className = "song-artist";
    span_1_2_2.innerHTML = item.artist;

    let span_1_3 = document.createElement("SPAN");
    span_1_3.className = "song-duration";
    span_1_3.innerHTML = getSongDuration(item);

    div_1_2.appendChild(span_1_2_1);
    div_1_2.appendChild(span_1_2_2);

    div_1_1.appendChild(div_1_1_1);
    div_1_1.appendChild(img_1_1_2);

    div_1.appendChild(div_1_1);
    div_1.appendChild(div_1_2);
    div_1.appendChild(span_1_3);
    playlistNodeElem.appendChild(div_1);
}

function getSongDuration(item) {
    let minutes = Math.floor(item.length / 60).toString();
    let seconds = Math.round(item.length - minutes * 60).toString().padStart(2, '0');

    return minutes + ':' + seconds;
}