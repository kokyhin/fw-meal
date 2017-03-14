#!/bin/sh
git pull
bower install
npm install
polymer build
pm2 startOrRestart ecosystem.config.js
