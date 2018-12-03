#!/bin/sh
cp -r /app/* /work
cd /work
npm run build
rm -rf node_modules
rm package.json
rm package-lock.json
