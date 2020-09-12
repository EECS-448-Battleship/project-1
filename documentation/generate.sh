#!/bin/sh
yarn install
./node_modules/.bin/jsdoc --destination ./generated --recurse ../src
