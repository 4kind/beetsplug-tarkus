var clickTouch = (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) ? 'touchstart' : 'click';

Amplitude.init({
    'songs': []
});

/**
 * Shows the playlist
 */
document.getElementsByClassName('show-playlist')[0].addEventListener(clickTouch, function () {
    document.getElementById('white-player-playlist-container').classList.remove('slide-out-top');
    document.getElementById('white-player-playlist-container').classList.add('slide-in-top');
    document.getElementById('white-player-playlist-container').style.display = 'block';
}, false);

/**
 * Hide the playlist
 */
document.getElementsByClassName('close-playlist')[0].addEventListener(clickTouch, function () {
    document.getElementById('white-player-playlist-container').classList.remove('slide-in-top');
    document.getElementById('white-player-playlist-container').classList.add('slide-out-top');
    document.getElementById('white-player-playlist-container').style.display = 'none';
}, false);

var queryInput = document.getElementById("query");

/**
 * Execute Beets Query
 */
document.getElementById('queryBtn').addEventListener(clickTouch, function () {

    (new QueryListBuilder()).executeBeetsQuery(queryInput.value, true);
}, false);

/**
 * Execute query when pressing "Enter" on the keyboard
 */
queryInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        (new QueryListBuilder()).executeBeetsQuery(queryInput.value, true);
    }
}, false);

var Song = function Song(item) {
    this.id = item.id;
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
};

/**
 * Creates DOM elements for beets query results and adds click events to add songs to playlist.
 *
 * @constructor
 */
var QueryListBuilder = function QueryListBuilder() {
    this.songsToAdd = [];
    this.songsNodeContainer = document.getElementById('songs-node-container');
    this.songsNodeContainer.innerHTML = '';
    this.next = document.getElementById('next');

    /**
     * Execute async beets request
     *
     * @param {String} query
     * @param {Boolean} buildHtmlDom
     */
    this.executeBeetsQuery = function (query, buildHtmlDom) {
        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var response = JSON.parse(this.responseText)
                var items = response.items;
                var songs = self.songsToAdd;

                if (items.length === 0) {
                    self._addNoSongFoundElement();
                } else {
                    for (var i = 0; i < items.length; i++) {
                        var song = new Song(items[i]);

                        // add only songs that dont exist yet in Amplitude
                        var index = self._getIndexOfSong(songs, song);

                        if (index < 0) {
                            self.songsToAdd.push(song);
                            index = songs.length;
                        }

                        if (true === buildHtmlDom) {
                            self._buildSongListGroupedByAlbum(song, index);
                        } else {
                            self._addSongToPlaylist(index);
                        }
                    }
                }
            }
        };
        xhttp.open('GET', '/item/query/' + query, true);
        xhttp.send();
    }

    /**
     * Add element with hint that no song was found for the current query.
     *
     * @private
     */
    this._addNoSongFoundElement = function () {
        var noSongsFound = document.createElement('div');
        noSongsFound.setAttribute('class', 'album-to-add no-songs-found');
        noSongsFound.innerHTML = 'No songs found';

        this.songsNodeContainer.appendChild(noSongsFound);
    }

    /**
     * Create DOM elements for the Beets query results
     *
     * @param {Song} song
     * @param {Number} index
     *
     * @private
     */
    this._buildSongListGroupedByAlbum = function (song, index) {
        var albumChanged = this.albumId !== song.album_id;

        if (true === albumChanged) {
            this._addAlbumToQueryContainer(song);
        }

        if (null !== this.albumSongsContainer) {
            this._addSongToAlbumContainer(song, index);
        }

        this.albumId = song.album_id;
    }

    /**
     * Add div container for each album to group songs by album
     *
     * @param {Song} song
     *
     * @private
     */
    this._addAlbumToQueryContainer = function (song) {
        var albumElem = document.createElement('div');
        albumElem.setAttribute('class', 'album-to-add');
        albumElem.setAttribute('album-to-add', song.album_id);

        var albumArtContainer = document.createElement('div');
        albumArtContainer.setAttribute('class', 'album-art');

        var albumMetaData = document.createElement('div');

        var albumArtArtistElem = document.createElement('div');
        albumArtArtistElem.setAttribute('class', 'album-artist');
        albumArtArtistElem.innerHTML = song.albumartist;

        var albumArtAlbumElem = document.createElement('div');
        albumArtAlbumElem.setAttribute('class', 'album-album');
        albumArtAlbumElem.innerHTML = song.album;

        var albumArtYearElem = document.createElement('div');
        albumArtYearElem.setAttribute('class', 'album-year');
        albumArtYearElem.innerHTML = song.original_year;

        var imgElem = document.createElement('img');
        imgElem.setAttribute('src', song.cover_art_url);
        imgElem.setAttribute('album-to-add', song.album_id);

        this._addAlbumToPlaylistEvent(imgElem);

        albumMetaData.appendChild(albumArtArtistElem);
        albumMetaData.appendChild(albumArtAlbumElem);
        albumMetaData.appendChild(albumArtYearElem);

        albumArtContainer.appendChild(imgElem);
        albumArtContainer.appendChild(albumMetaData);

        this.albumSongsContainer = document.createElement('div');
        this.albumSongsContainer.setAttribute('class', 'album-songs');

        albumElem.appendChild(albumArtContainer);
        albumElem.appendChild(this.albumSongsContainer);
        this.songsNodeContainer.appendChild(albumElem);
    }

    /**
     * Add song to album container
     *
     * @param {Song} song
     * @param {Number} index
     *
     * @private
     */
    this._addSongToAlbumContainer = function (song, index) {
        var addSongToPlaylistElem = document.createElement('a');
        addSongToPlaylistElem.setAttribute('class', 'add-to-playlist-button');
        addSongToPlaylistElem.setAttribute('song-to-add', index.toString());

        var songTrack = document.createElement('span');
        songTrack.setAttribute('class', 'song-track');
        songTrack.innerHTML = song.track + '.';

        var songName = document.createElement('span');
        songName.setAttribute('class', 'song-name');
        songName.innerHTML = song.name;

        var songLength = document.createElement('span');
        songLength.setAttribute('class', 'song-length');
        songLength.innerHTML = this._getSongLengthFormatted(song.length);

        addSongToPlaylistElem.appendChild(songTrack);
        addSongToPlaylistElem.appendChild(songName);
        addSongToPlaylistElem.appendChild(songLength);

        this._addSongToPlaylistEvent(addSongToPlaylistElem);

        var songElem = document.createElement('div');
        songElem.setAttribute('class', 'song-to-add');

        songElem.appendChild(addSongToPlaylistElem);

        this.albumSongsContainer.appendChild(songElem);
    }

    /**
     * Get formatted track length in mm:ss
     *
     * @param {Number} songLength
     *
     * @returns {string}
     *
     * @private
     */
    this._getSongLengthFormatted = function (songLength) {
        return new Date(1000 * songLength).toISOString().substr(14, 5);
    }

    /**
     * Click event to add song to the playlist
     *
     * @param {Element} element
     *
     * @private
     */
    this._addSongToPlaylistEvent = function (element) {
        var self = this;

        element.addEventListener(clickTouch, function () {
            var songToAddIndex = this.getAttribute('song-to-add');

            self._addSongToPlaylist(songToAddIndex);
        }, false);
    }

    /**
     * Click event to add album to the playlist
     *
     * @param {Element} element
     *
     * @private
     */
    this._addAlbumToPlaylistEvent = function (element) {
        var self = this;

        element.addEventListener(clickTouch, function () {
            var albumId = element.getAttribute('album-to-add');
            var query = 'album_id:' + albumId;
            self.executeBeetsQuery(query, false);
        }, false);
    }

    /**
     * Add song by index to playlist
     *
     * @param {Number} songToAddIndex
     *
     * @private
     */
    this._addSongToPlaylist = function (songToAddIndex) {
        /*
         Adds the song to Amplitude, appends the song to the display,
         then rebinds all of the AmplitudeJS elements.
        */
        var newIndex = Amplitude.addSong(this.songsToAdd[songToAddIndex]);

        this._appendToSongDisplay(this.songsToAdd[songToAddIndex], newIndex);
        Amplitude.bindNewElements();

        var isFirstSong = Amplitude.getSongs().length === 1;
        if (isFirstSong) {
            Amplitude.next();
        }
    }

    this._getIndexOfSong = function (songs, song) {
        return songs.findIndex(function (x) {
            return x.id === song.id;
        });
    }

    /**
     * Appends the song to the display
     *
     * @param {Song} song
     * @param {Number} index
     *
     * @private
     */
    this._appendToSongDisplay = function (song, index) {

        // Grabs the playlist element we will be appending to
        var playlistElement = document.querySelector('.white-player-playlist');

        // Create container to play/pause each song
        var playlistSongContainer = document.createElement('div');
        playlistSongContainer.setAttribute('class', 'white-player-playlist-song-container');

        // Creates the playlist song element
        var playlistSong = document.createElement('div');
        playlistSong.setAttribute('class', 'white-player-playlist-song amplitude-song-container amplitude-play-pause');
        playlistSong.setAttribute('data-amplitude-song-index', index.toString());

        // Removes song from playlist
        var playlistSongRemove = document.createElement('div');
        playlistSongRemove.setAttribute('class', 'playlist-song-remove');
        playlistSongRemove.setAttribute('data-amplitude-song-index', index.toString());

        this._addEventListenerRemoveSong(playlistSongRemove, playlistSongContainer);

        // Creates the playlist song image element
        var playlistSongRemoveImg = document.createElement('img');
        playlistSongRemoveImg.setAttribute('src', "/static/images/close.svg");

        // Creates the playlist song image element
        var playlistSongImg = document.createElement('img');
        playlistSongImg.setAttribute('src', song.cover_art_url);

        // Creates the playlist song meta element
        var playlistSongMeta = document.createElement('div');
        playlistSongMeta.setAttribute('class', 'playlist-song-meta');

        // Creates the playlist song name element
        var playlistSongName = document.createElement('span');
        playlistSongName.setAttribute('class', 'playlist-song-name');
        playlistSongName.innerHTML = song.name;

        // Creates the playlist song artist album element
        var playlistSongArtistAlbum = document.createElement('span');
        playlistSongArtistAlbum.setAttribute('class', 'playlist-song-artist');
        playlistSongArtistAlbum.innerHTML = song.artist + ' &bull; ' + song.album;

        // Appends the name and artist album to the playlist song meta
        playlistSongMeta.appendChild(playlistSongName);
        playlistSongMeta.appendChild(playlistSongArtistAlbum);

        // Appends the song image and meta to the song element
        playlistSong.appendChild(playlistSongImg);
        playlistSong.appendChild(playlistSongMeta);

        // Appends image to remove song element
        playlistSongRemove.appendChild(playlistSongRemoveImg);

        // Appends Song and Remove Song to Song Container
        playlistSongContainer.appendChild(playlistSong);
        playlistSongContainer.appendChild(playlistSongRemove);

        // Appends the song element to the playlist
        playlistElement.appendChild(playlistSongContainer);
    }

    /**
     * Add Event Handler to remove song.
     * Song is removed from Amplitude songs and playlist in DOM.
     *
     * @param {Element} element
     * @param {Element} elementToRemove
     *
     * @private
     */
    this._addEventListenerRemoveSong = function (element, elementToRemove) {
        var self = this;

        element.addEventListener(clickTouch, function () {
            var songIndexToRemove = this.getAttribute('data-amplitude-song-index');
            Amplitude.removeSong(songIndexToRemove);

            elementToRemove.remove();
            self._removeSongFromPlaylistInDom();
        })
    }

    /**
     * Re-init song index in playlist.
     *
     * @private
     */
    this._removeSongFromPlaylistInDom = function () {
        var songsElem = document.getElementsByClassName('white-player-playlist-song-container');

        for (var i = 0; i < songsElem.length; i++) {
            var songElem = songsElem[i];
            var songIndex = i.toString();
            songElem.children[0].setAttribute('data-amplitude-song-index', songIndex);
            songElem.children[1].setAttribute('data-amplitude-song-index', songIndex);
        }
    }
}