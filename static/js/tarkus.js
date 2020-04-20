Amplitude.init({
    'songs': []
});

/**
 * Shows the playlist
 */
document.getElementsByClassName('show-playlist')[0].addEventListener('click', function () {
    document.getElementById('white-player-playlist-container').classList.remove('slide-out-top');
    document.getElementById('white-player-playlist-container').classList.add('slide-in-top');
    document.getElementById('white-player-playlist-container').style.display = 'block';
});

/**
 * Hide the playlist
 */
document.getElementsByClassName('close-playlist')[0].addEventListener('click', function () {
    document.getElementById('white-player-playlist-container').classList.remove('slide-in-top');
    document.getElementById('white-player-playlist-container').classList.add('slide-out-top');
    document.getElementById('white-player-playlist-container').style.display = 'none';
});

let queryInput = document.getElementById("query");

/**
 * Execute Beets Query
 */
document.getElementById('queryBtn').addEventListener('click', function () {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let response = JSON.parse(this.responseText)
            let items = response.items;
            let queryListBuilder = new QueryListBuilder();

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let song = new Song(item);

                queryListBuilder.buildIt(song, i);
            }
        }
    };
    xhttp.open('GET', '/item/query/' + queryInput.value, true);
    xhttp.send();
});

/**
 * Execute query when pressing "Enter" on the keyboard
 */
queryInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById('queryBtn').click();
    }
});

let Song = class {
    constructor(item) {
        this.track = item.track;
        this.title = item.title;
        this.length = item.length;
        this.original_year = item.original_year;
        this.name = item.title;
        this.artist = item.artist;
        this.mb_artistid = item.mb_artistid;
        this.mb_albumid = item.mb_albumid;
        this.mb_albumartistid = item.mb_albumartistid;
        this.albumartist = item.albumartist;
        this.year = item.year;
        this.album = item.album;
        this.album_id = item.album_id;
        this.url = '/item/' + item.id + '/file';
        this.cover_art_url = '/album/' + item.album_id + '/art';
    }
}

/**
 * Creates DOM elements for beets query results and adds click events to add songs to playlist.
 *
 * @type {QueryListBuilder}
 */
let QueryListBuilder = class {

    constructor() {
        this.songsToAdd = [];
        this.songsNodeContainer = document.getElementById('songs-node-container');
        this.songsNodeContainer.innerHTML = '';
        this.next = document.getElementById('next');
    }

    /**
     * Create DOM elements for the Beets query results
     *
     * @param {Song} song
     * @param {Number} index
     */
    buildIt = function (song, index) {
        let self = this;
        let albumChanged = this.albumId !== song.album_id;

        if (true === albumChanged) {
            self.addAlbumToQueryContainer(song);
        }

        if (null !== this.albumSongsContainer) {
            self.addSongToAlbumContainer(song, index);
        }

        this.songsToAdd.push(song);
        this.albumId = song.album_id;
    }

    /**
     * Add div container for each album to group songs by album
     *
     * @param {Song} song
     */
    addAlbumToQueryContainer = function (song) {
        let albumElem = document.createElement('div');
        albumElem.className = 'album-to-add'
        albumElem.setAttribute('album-to-add', song.album_id);

        let albumArtContainer = document.createElement('div');
        albumArtContainer.className = 'album-art';

        let querySongArtistAlbumElem = document.createElement('div');
        querySongArtistAlbumElem.setAttribute('class', 'query-song-artist');
        querySongArtistAlbumElem.innerHTML = song.artist + ' &bull; ' + song.album;

        let imgElem = document.createElement('img');
        imgElem.setAttribute('src', song.cover_art_url);

        albumArtContainer.appendChild(imgElem);
        albumArtContainer.appendChild(querySongArtistAlbumElem);

        this.albumSongsContainer = document.createElement('div');
        this.albumSongsContainer.className = 'album-songs';

        albumElem.appendChild(albumArtContainer);
        albumElem.appendChild(this.albumSongsContainer);
        this.songsNodeContainer.appendChild(albumElem);
    }


    /**
     * Add song to album container
     *
     * @param {Song} song
     * @param {Number} index
     */
    addSongToAlbumContainer = function (song, index) {
        let self = this;

        let addSongToPlaylistElem = document.createElement('a');
        addSongToPlaylistElem.innerHTML = song.title;
        addSongToPlaylistElem.className = 'add-to-playlist-button'
        addSongToPlaylistElem.setAttribute('song-to-add', index.toString());

        self.createAddSongToPlaylistEvent(addSongToPlaylistElem);

        let songElem = document.createElement('div');
        songElem.className = 'song-to-add';

        songElem.appendChild(addSongToPlaylistElem);

        this.albumSongsContainer.appendChild(songElem);
    }

    /**
     * Click event to add song to the playlist
     *
     * @param {Element} element
     */
    createAddSongToPlaylistEvent = function (element) {
        let self = this;

        element.addEventListener('click', function () {
            /*
              Adds the song to Amplitude, appends the song to the display,
              then rebinds all of the AmplitudeJS elements.
            */
            let songToAddIndex = this.getAttribute('song-to-add');
            let newIndex = Amplitude.addSong(self.songsToAdd[songToAddIndex]);

            self.appendToSongDisplay(self.songsToAdd[songToAddIndex], newIndex);
            Amplitude.bindNewElements();

            const isFirstSong = Amplitude.getSongs().length === 1;
            if (isFirstSong) {
                self.next.click();
            }
        });
    }

    /**
     * Appends the song to the display
     *
     * @param {Song} song
     * @param {Number} index
     */
    appendToSongDisplay = function (song, index) {

        // Grabs the playlist element we will be appending to
        let playlistElement = document.querySelector('.white-player-playlist');

        // Creates the playlist song element
        let playlistSong = document.createElement('div');
        playlistSong.setAttribute('class', 'white-player-playlist-song amplitude-song-container amplitude-play-pause');
        playlistSong.setAttribute('data-amplitude-song-index', index.toString());

        // Creates the playlist song image element
        let playlistSongImg = document.createElement('img');
        playlistSongImg.setAttribute('src', song.cover_art_url);

        // Creates the playlist song meta element
        let playlistSongMeta = document.createElement('div');
        playlistSongMeta.setAttribute('class', 'playlist-song-meta');

        // Creates the playlist song name element
        let playlistSongName = document.createElement('span');
        playlistSongName.setAttribute('class', 'playlist-song-name');
        playlistSongName.innerHTML = song.name;

        // Creates the playlist song artist album element
        let playlistSongArtistAlbum = document.createElement('span');
        playlistSongArtistAlbum.setAttribute('class', 'playlist-song-artist');
        playlistSongArtistAlbum.innerHTML = song.artist + ' &bull; ' + song.album;

        // Appends the name and artist album to the playlist song meta
        playlistSongMeta.appendChild(playlistSongName);
        playlistSongMeta.appendChild(playlistSongArtistAlbum);

        // Appends the song image and meta to the song element
        playlistSong.appendChild(playlistSongImg);
        playlistSong.appendChild(playlistSongMeta);

        // Appends the song element to the playlist
        playlistElement.appendChild(playlistSong);
    }
};