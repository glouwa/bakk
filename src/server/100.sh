#!/bin/bash

rm ../../log/*

for i in `seq 1 15`;
do
    for devCount in 1 2
    do
        node starter.js workerKill      $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js overlordWorkers $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js workerBacc0     $i workerBacc0.csv    $devCount &&

        node starter.js workerKill      $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js overlordWorkers $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js workerBacc1     $i workerBacc1.csv    $devCount &&

        node starter.js workerKill      $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js overlordWorkers $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js workerPrimeCpp  $i workerPrimeCpp.csv $devCount
    done
done
