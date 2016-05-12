#!/bin/bash
for i in `seq 1 100`;
do
    node starter.js resetSys               &&
    sleep 3                                &&
    node starter.js serverWorkers          &&
    sleep 3                                &&
    node starter.js primeCpp primeCpp.csv
done
