#!/bin/bash

if [ -d "node_modules/.bin" ]; then
    chmod -R +x node_modules/.bin/*
    echo "Fixed permissions for node_modules/.bin"
fi
