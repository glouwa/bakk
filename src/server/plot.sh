#!/bin/bash

gnuplot -persist -e "projectname='workerBacc0'" plotbox.plt
gnuplot -persist -e "projectname='workerBacc0'; max=50000" plothist.plt

gnuplot -persist -e "projectname='workerBacc1'" plotbox.plt
gnuplot -persist -e "projectname='workerBacc1'; max=120" plothist.plt

gnuplot -persist -e "projectname='workerPrimeCpp'" plotbox.plt
gnuplot -persist -e "projectname='workerPrimeCpp'; max=20000" plothist.plt
