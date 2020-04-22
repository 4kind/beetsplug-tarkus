var _temp;

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
    } else {
        obj[key] = value;
    }
    return obj;
}

function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}

var clickTouch = 'ontouchstart' in window || window.DocumentTouch && _instanceof(document, DocumentTouch) ? 'touchstart' : 'click';

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
    new QueryListBuilder().executeBeetsQuery(queryInput.value, true);
}, false);
/**
 * Execute query when pressing "Enter" on the keyboard
 */

queryInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        new QueryListBuilder().executeBeetsQuery(queryInput.value, true);
    }
}, false);

var Song = function Song(item) {
    "use strict";

    _classCallCheck(this, Song);

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
 * @type {QueryListBuilder}
 */


var QueryListBuilder = (_temp = /*#__PURE__*/function () {
    "use strict";

    function QueryListBuilder() {
        _classCallCheck(this, QueryListBuilder);

        _defineProperty(this, "buildSongListGroupedByAlbum", function (song, index) {
            var self = this;
            var albumChanged = this.albumId !== song.album_id;

            if (true === albumChanged) {
                self.addAlbumToQueryContainer(song);
            }

            if (null !== this.albumSongsContainer) {
                self.addSongToAlbumContainer(song, index);
            }

            this.albumId = song.album_id;
        });

        _defineProperty(this, "addAlbumToQueryContainer", function (song) {
            var self = this;
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
            self.addAlbumToPlaylistEvent(imgElem);
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
        });

        _defineProperty(this, "addSongToAlbumContainer", function (song, index) {
            var self = this;
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
            songLength.innerHTML = self.getSongLengthFormatted(song.length);
            addSongToPlaylistElem.appendChild(songTrack);
            addSongToPlaylistElem.appendChild(songName);
            addSongToPlaylistElem.appendChild(songLength);
            self.addSongToPlaylistEvent(addSongToPlaylistElem);
            var songElem = document.createElement('div');
            songElem.setAttribute('class', 'song-to-add');
            songElem.appendChild(addSongToPlaylistElem);
            this.albumSongsContainer.appendChild(songElem);
        });

        _defineProperty(this, "getSongLengthFormatted", function (songLength) {
            return new Date(1000 * songLength).toISOString().substr(14, 5);
        });

        _defineProperty(this, "addSongToPlaylistEvent", function (element) {
            var self = this;
            element.addEventListener(clickTouch, function () {
                var songToAddIndex = this.getAttribute('song-to-add');
                self.addSongToPlaylist(songToAddIndex);
            }, false);
        });

        _defineProperty(this, "addAlbumToPlaylistEvent", function (element) {
            var self = this;
            element.addEventListener(clickTouch, function () {
                var albumId = element.getAttribute('album-to-add');
                var query = 'album_id:' + albumId;
                self.executeBeetsQuery(query);
            }, false);
        });

        _defineProperty(this, "executeBeetsQuery", function (query) {
            var buildHtmlDom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var xhttp = new XMLHttpRequest();
            var self = this;

            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    var items = response.items;
                    var songs = self.songsToAdd;

                    var _loop = function _loop(i) {
                        var song = new Song(items[i]); // add only songs that dont exist yet in Amplitude

                        var index = songs.findIndex(function (x) {
                            return x.id === song.id;
                        });

                        if (index < 0) {
                            self.songsToAdd.push(song);
                            index = songs.length;
                        }

                        if (true === buildHtmlDom) {
                            self.buildSongListGroupedByAlbum(song, index);
                        } else {
                            self.addSongToPlaylist(index);
                        }
                    };

                    for (var i = 0; i < items.length; i++) {
                        _loop(i);
                    }
                }
            };

            xhttp.open('GET', '/item/query/' + query, true);
            xhttp.send();
        });

        _defineProperty(this, "appendToSongDisplay", function (song, index) {
            // Grabs the playlist element we will be appending to
            var playlistElement = document.querySelector('.white-player-playlist'); // Creates the playlist song element

            var playlistSong = document.createElement('div');
            playlistSong.setAttribute('class', 'white-player-playlist-song amplitude-song-container amplitude-play-pause');
            playlistSong.setAttribute('data-amplitude-song-index', index.toString()); // Creates the playlist song image element

            var playlistSongImg = document.createElement('img');
            playlistSongImg.setAttribute('src', song.cover_art_url); // Creates the playlist song meta element

            var playlistSongMeta = document.createElement('div');
            playlistSongMeta.setAttribute('class', 'playlist-song-meta'); // Creates the playlist song name element

            var playlistSongName = document.createElement('span');
            playlistSongName.setAttribute('class', 'playlist-song-name');
            playlistSongName.innerHTML = song.name; // Creates the playlist song artist album element

            var playlistSongArtistAlbum = document.createElement('span');
            playlistSongArtistAlbum.setAttribute('class', 'playlist-song-artist');
            playlistSongArtistAlbum.innerHTML = song.artist + ' &bull; ' + song.album; // Appends the name and artist album to the playlist song meta

            playlistSongMeta.appendChild(playlistSongName);
            playlistSongMeta.appendChild(playlistSongArtistAlbum); // Appends the song image and meta to the song element

            playlistSong.appendChild(playlistSongImg);
            playlistSong.appendChild(playlistSongMeta); // Appends the song element to the playlist

            playlistElement.appendChild(playlistSong);
        });

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


    _createClass(QueryListBuilder, [{
        key: "addSongToPlaylist",

        /**
         * Add song by index to playlist
         *
         * @param {Number} songToAddIndex
         */
        value: function addSongToPlaylist(songToAddIndex) {
            var self = this;
            /*
             Adds the song to Amplitude, appends the song to the display,
             then rebinds all of the AmplitudeJS elements.
            */

            var newIndex = Amplitude.addSong(self.songsToAdd[songToAddIndex]);
            self.appendToSongDisplay(self.songsToAdd[songToAddIndex], newIndex);
            Amplitude.bindNewElements();
            var isFirstSong = Amplitude.getSongs().length === 1;

            if (isFirstSong) {
                self.next.click();
            }
        }
        /**
         * Execute async beets request
         *
         * @param {String} query
         * @param {Boolean} buildHtmlDom
         */

    }]);

    return QueryListBuilder;
}(), _temp);