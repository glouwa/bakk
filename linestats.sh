#!/bin/bash
find ./projects  -name '*.js' -not \( -path "./src/node_modules/*" -o -path "./src/views/lib/*" \) | xargs wc -l
find ./src/views -name '*.js' -not \( -path "./src/node_modules/*" -o -path "./src/views/lib/*" \) | xargs wc -l
find ./src/      -name '*.js' -not \( -path "./src/node_modules/*" -o -path "./src/views/*"     \) | xargs wc -l

echo "
    17.5.2016

  231 ./projects/workerModel3d.js
   58 ./projects/overlordWorkers.js
   79 ./projects/workerBacc0.js
   83 ./projects/serverFolder.js
   65 ./projects/serverCmd.js
   52 ./projects/workerKill.js
   39 ./projects/serverOutput.js
   47 ./projects/workerBacc1.js
   67 ./projects/localSetIteration.js
   50 ./projects/localOutput.js
  145 ./projects/workerPrimeCpp.js
  166 ./projects/serverFragmentFolder.js
   34 ./projects/localAjax.js
 1116 total
  259 ./src/views/view.js
  192 ./src/views/client.js
   86 ./src/views/setView.js
   74 ./src/views/network.js
  187 ./src/views/lineViews/primitives.js
   93 ./src/views/lineViews/comboBox.js
   44 ./src/views/lineViews/labeledSlider.js
  173 ./src/views/lineViews/decorators.js
  127 ./src/views/a3Views/graphView.js
   26 ./src/views/a3Views/projectView.js
  144 ./src/views/a3Views/networkView.js
   79 ./src/views/a3Views/jobView.js
  199 ./src/views/a3Views/networkNodeView.js
  215 ./src/views/a3Views/decorators.js
  359 ./src/views/a3Views/jobStatusView.js
 2257 total
  109 ./src/config.js
  157 ./src/tools.js
   98 ./src/app.js
   89 ./src/sim.js
  124 ./src/server/server.js
   12 ./src/server/overlord.js
   57 ./src/server/worker.js
  144 ./src/server/starter.js
   97 ./src/server/network.js
  220 ./src/job/jobLogic.js
  342 ./src/job/job.js
  174 ./src/job/toolJobs.js
  258 ./src/types/mvj.js
   83 ./src/types/project.js
  123 ./src/types/pSet.js
   26 ./src/types/network.js
   60 ./src/messages.js
 2173 total

    10.5.2016

   145 ./projects/primeCpp.js
    83 ./projects/serverFolder.js
    67 ./projects/serverCmd.js
    67 ./projects/localSetIteration.js
    28 ./projects/serverWorkers.js
   230 ./projects/model3d.js
    78 ./projects/serverBakk.js
    38 ./projects/serverOuput.js
    50 ./projects/localOutput.js
   168 ./projects/prime.js
   159 ./projects/serverFragmentFolder.js
    34 ./projects/localAjax.js
   109 ./src/config.js
   157 ./src/tools.js
   259 ./src/views/view.js
   188 ./src/views/client.js
    86 ./src/views/setView.js
    70 ./src/views/network.js
   189 ./src/views/lineViews/primitives.js
    93 ./src/views/lineViews/comboBox.js
    44 ./src/views/lineViews/labeledSlider.js
   173 ./src/views/lineViews/decorators.js
   126 ./src/views/a3Views/graphView.js
    26 ./src/views/a3Views/projectView.js
   144 ./src/views/a3Views/networkView.js
    79 ./src/views/a3Views/jobView.js
   199 ./src/views/a3Views/networkNodeView.js
   215 ./src/views/a3Views/decorators.js
   351 ./src/views/a3Views/jobStatusView.js
    89 ./src/sim.js
   145 ./src/server/server.js
   138 ./src/server/worker.js
   150 ./src/server/starter.js
    96 ./src/server/network.js
   224 ./src/job/jobLogic.js
   311 ./src/job/job.js
   212 ./src/job/toolJobs.js
   258 ./src/types/mvj.js
    79 ./src/types/project.js
   123 ./src/types/pSet.js
    64 ./src/types/network.js
    60 ./src/messages.js
  5604 total
  "
