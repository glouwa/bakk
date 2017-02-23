#!/bin/bash
for file in ./*.js
do
    echo $file
    node "$file"
done
