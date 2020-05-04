#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import setup

setup(
    name='tarkus',
    version='0.0.1',
    description='alternate web GUI using AmplitudeJS',
    author='Andreas Kind',
    author_email='andreas.kind@ghosttown-productions.de',
    license='MIT',

    package_dir={"": "src"},

    packages=[
        'beetsplug/tarkus',
    ],

    package_data={
        "beetsplug/tarkus": [
            "static/images/*.svg",
            "static/*.js",
            "static/*.css",
            "templates/*.html",
        ],
    },

    classifiers=[
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
    ],
)
