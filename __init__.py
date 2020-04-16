"""A Web interface to beets."""
from __future__ import division, absolute_import, print_function

import flask
import os
from beets.plugins import BeetsPlugin
from beets import ui, util
from flask import g, jsonify
from unidecode import unidecode

# Flask setup.
app = flask.Flask(__name__)


@app.before_request
def before_request():
    g.lib = app.config['lib']


@app.route('/item/<int:item_id>/file')
def item_file(item_id):
    item = g.lib.get_item(item_id)
    item_path = util.py3_path(item.path)

    try:
        unicode_item_path = util.text_string(item.path)
    except (UnicodeDecodeError, UnicodeEncodeError):
        unicode_item_path = util.displayable_path(item.path)

    base_filename = os.path.basename(unicode_item_path)
    try:
        # Imitate http.server behaviour
        base_filename.encode("latin-1", "strict")
    except UnicodeEncodeError:
        safe_filename = unidecode(base_filename)
    else:
        safe_filename = base_filename

    response = flask.send_file(
        item_path,
        as_attachment=True,
        attachment_filename=safe_filename
    )
    response.headers['Content-Length'] = os.path.getsize(item_path)
    return response


@app.route('/item/query/', defaults={'queries': None})
@app.route('/item/query/<queries>')
def item_query(queries):
    if "+ " or "- " not in queries:
        if queries is None:
            queries = ""
        queries += " albumartist+ year+ track+"

    items = []
    res = g.lib.items(queries)
    for row in res:
        items.append({
            "id": row.id,
            "album": row.album,
            "title": row.title,
            "track": row.track,
            "length": row.length,
            "artist": row.artist,
            "album_id": row.album_id,
            "mb_albumid": row.mb_albumid,
            "mb_artistid": row.mb_artistid,
            "mb_albumartistid": row.mb_albumartistid,
            "genre": row.genre,
            "albumartist": row.albumartist,
            "lyrics": row.lyrics,
            "year": row.year,
            "month": row.month,
            "day": row.day,
            "original_year": row.original_year,
            "original_month": row.original_month,
            "original_day": row.original_day,
        })

    return jsonify({"items": items})


# Albums.
@app.route('/album/<int:album_id>/art')
def album_art(album_id):
    album = g.lib.get_album(album_id)
    if album and album.artpath:
        return flask.send_file(album.artpath.decode())
    else:
        return flask.abort(404)


# UI.

@app.route('/')
def home():
    return flask.render_template('index.html')


# Plugin hook.

class WebPlugin(BeetsPlugin):
    def __init__(self):
        super(WebPlugin, self).__init__()
        self.config.add({
            'host': u'0.0.0.0',
            'port': 8338,
            'cors': '',
            'cors_supports_credentials': False,
            'reverse_proxy': False,
            'include_paths': False,
        })

    def commands(self):
        cmd = ui.Subcommand('tarkus', help=u'start a Web interface')
        cmd.parser.add_option(u'-d', u'--debug', action='store_true',
                              default=False, help=u'debug mode')

        def func(lib, opts, args):
            args = ui.decargs(args)
            if args:
                self.config['host'] = args.pop(0)
            if args:
                self.config['port'] = int(args.pop(0))

            app.config['lib'] = lib
            # Normalizes json output
            app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

            app.config['INCLUDE_PATHS'] = self.config['include_paths']

            # Enable CORS if required.
            if self.config['cors']:
                self._log.info(u'Enabling CORS with origin: {0}',
                               self.config['cors'])
                from flask_cors import CORS
                app.config['CORS_ALLOW_HEADERS'] = "Content-Type"
                app.config['CORS_RESOURCES'] = {
                    r"/*": {"origins": self.config['cors'].get(str)}
                }
                CORS(
                    app,
                    supports_credentials=self.config[
                        'cors_supports_credentials'
                    ].get(bool)
                )

            # Allow serving behind a reverse proxy
            if self.config['reverse_proxy']:
                app.wsgi_app = ReverseProxied(app.wsgi_app)

            # Start the web application.
            app.run(host=self.config['host'].as_str(),
                    port=self.config['port'].get(int),
                    debug=opts.debug, threaded=True)

        cmd.func = func
        return [cmd]


class ReverseProxied(object):
    '''Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.

    In nginx:
    location /myprefix {
        proxy_pass http://192.168.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Script-Name /myprefix;
        }

    From: http://flask.pocoo.org/snippets/35/

    :param app: the WSGI application
    '''

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]

        scheme = environ.get('HTTP_X_SCHEME', '')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)
