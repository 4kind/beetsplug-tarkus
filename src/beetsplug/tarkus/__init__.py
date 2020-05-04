"""A Web interface to beets."""
from __future__ import division, absolute_import, print_function

from beetsplug import web
from flask import Blueprint

# Flask setup.
app = web.app

simple_page = Blueprint('admin', __name__)

app.template_folder = simple_page.root_path + '/templates'
app.static_folder = simple_page.root_path + '/static'

app.register_blueprint(simple_page)
