#!/bin/bash

rm ../../log/*

for devCount in 1 2
do
    for i in `seq 1 1`;
    do
        node starter.js workerKill      $i ""              $devCount &&
        sleep 3                                                      &&
        node starter.js overlordWorkers $i ""              $devCount &&
        sleep 3                                                      &&
        node starter.js workerBacc0     $i workerBacc0.csv $devCount
    done
done



for devCount in 1 2
do
    for i in `seq 1 1`;
    do
        node starter.js workerKill      $i ""              $devCount &&
        sleep 3                                                      &&
        node starter.js overlordWorkers $i ""              $devCount &&
        sleep 3                                                      &&
        node starter.js workerBacc1     $i workerBacc1.csv $devCount
    done
done



for devCount in 1 2
do
    for i in `seq 1 1`;
    do
        node starter.js workerKill      $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js overlordWorkers $i ""                 $devCount &&
        sleep 3                                                         &&
        node starter.js workerPrimeCpp  $i workerPrimeCpp.csv $devCount
    done
done
