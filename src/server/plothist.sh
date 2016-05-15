reset
n=50 #number of intervals
max=50 #30000 #50
min=0 #min value
width=(max-min)/n #interval width
#function used to map a value to the intervals
hist(x,width)=width*floor(x/width)+width/2.0
#set term png #output terminal and file
#set output "histogram.png"
set xrange [min:max]
set yrange [0:]
#to put an empty boundary around the
#data inside an autoscaled graph.
set offset graph 0.05,0.05,0.05,0.0
set xtics min,(max-min)/5,max
set boxwidth width*0.9
set style fill solid 0.5 #fillstyle
set tics out nomirror
set xlabel "job exec time in ms"
set ylabel "Frequency"
#count and plot

set terminal png
set output '../../log/2-worker-'.projectname.'.png'

#plot "../../log/data.dat" u (hist($1,width)):(1.0) smooth freq w boxes lc rgb"green" notitle
plot '../../log/2-worker-'.projectname.'.csv' u (hist($1,width)):(1) smooth freq with boxes lc rgb"blue" notitle
