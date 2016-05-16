#!/bin/bash

gnuplot -persist -e "projectname='workerBacc0'" plotbox.plt
gnuplot -persist -e "projectname='workerBacc0'" plothist.plt


gnuplot -persist -e "projectname='workerBacc1'" plotbox.plt
gnuplot -persist -e "projectname='workerBacc1'" plothist.plt

gnuplot -persist -e "projectname='workerPrimeCpp'" plotbox.plt
gnuplot -persist -e "projectname='workerPrimeCpp'" plothist.plt
