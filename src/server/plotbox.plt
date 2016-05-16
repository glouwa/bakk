reset

set style fill solid 0.1
set style boxplot outliers pointtype 7
set style data boxplot
set boxwidth  0.5
set pointsize 0.2

unset key
set border 2
set xtics ("1 Device" 1, "2 Device" 2, "4 Device" 4, "6 Device" 6) scale 0.0
set xtics nomirror
set ytics nomirror
set yrange [0:]

set terminal png
set output '../../log/all-'.projectname.'.png'

plot '../../log/1-all-'.projectname.'.csv' using (1):3, '' using (2):3, \
     '../../log/2-all-'.projectname.'.csv' using (4):3, '' using (6):3

