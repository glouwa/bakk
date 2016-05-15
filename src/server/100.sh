#!/bin/bash

rm ../../log/*

for devCount in 2
do
    for i in `seq 1 50`;
    do
        node starter.js resetSys $i "" $devCount            &&
        sleep 3                                             &&
        node starter.js serverWorkers $i "" $devCount       &&
        sleep 3                                             &&
        node starter.js serverBakk1 $i serverBakk1.csv $devCount
    done
done

gnuplot -persist -e "projectname='serverBakk1'" plotcurve.sh
gnuplot -persist -e "projectname='serverBakk1'" plothist.sh

for devCount in 2
do
    for i in `seq 1 50`;
    do
        node starter.js resetSys $i "" $devCount            &&
        sleep 3                                             &&
        node starter.js serverWorkers $i "" $devCount       &&
        sleep 3                                             &&
        node starter.js primeCpp $i primeCpp.csv $devCount
    done
done

gnuplot -persist -e "projectname='primeCpp'" plotcurve.sh
gnuplot -persist -e "projectname='primeCpp'" plothist.sh
