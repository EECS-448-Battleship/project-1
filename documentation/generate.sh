#!/bin/sh
yarn install
./node_modules/.bin/jsdoc --destination ./generated --readme ./README.md --recurse ../src
