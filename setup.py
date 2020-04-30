#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

setup(
    name='tarkus',
    version='0.0.1',
    description='alternate web API using Bottle.py',
    author='Andreas Kind',
    author_email='andreas.kind@ghosttown-productions.de',
    license='MIT',

    package_dir={"": "src"},

    packages=[
        'beetsplug/tarkus',
    ],

    package_data={
        # of the "mypkg" package, also:
        "beetsplug/tarkus": [
            "static/images/*.svg",
            "static/*.js",
            "static/*.css",
            "templates/*.html"
        ],
    },

    # packages=[
    #     'tarkus',
    # ],

    # install_requires=[
    #     'bottle>=0.12',
    # ],

    # extras_require={
    #     'waitress': ['waitress'],
    # },

    classifiers=[
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
    ],
)
