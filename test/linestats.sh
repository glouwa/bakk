#!/bin/bash
find ../modules/jobs  -name '*.js' -not \( -path "./src/node_modules/*" -o -path "./src/views/lib/*" \) | xargs wc -l
find ../modules/views -name '*.js' -not \( -path "./src/node_modules/*" -o -path "../modules/views/html/lib/*" \) | xargs wc -l
find ../src/          -name '*.js' -not \( -path "./src/node_modules/*" -o -path "./src/views/lib/*"     \) | xargs wc -l

echo "

    12.09.16

  237 ../modules/jobs/workerModel3d.js
   63 ../modules/jobs/overlordWorkers.js
   81 ../modules/jobs/workerBacc0.js
   84 ../modules/jobs/serverFolder.js
   65 ../modules/jobs/serverCmd.js
   51 ../modules/jobs/workerKill.js
   37 ../modules/jobs/serverOutput.js
   46 ../modules/jobs/workerBacc1.js
   68 ../modules/jobs/localSetIteration.js
   50 ../modules/jobs/localOutput.js
  144 ../modules/jobs/workerPrimeCpp.js
  130 ../modules/jobs/serverFragmentFolder.js
   49 ../modules/jobs/localAjax.js
 1105 total
  179 ../modules/views/html/htmlBasics.js
   14 ../modules/views/html/a5/network-listView.js
  127 ../modules/views/html/a5/graphView.js
   54 ../modules/views/html/a5/job-runView.js
    1 ../modules/views/html/a5/string-textEditView.js
  133 ../modules/views/html/a5/object-visGraphView.js
   41 ../modules/views/html/a5/job-progressTreeView.js
  144 ../modules/views/html/a5/job-visGraphView.js
    1 ../modules/views/html/a5/code-editView.js
  331 ../modules/views/html/a5/job-d3gantView.js
  160 ../modules/views/html/a5/job-visGantView.js
   90 ../modules/views/html/a5/object-a5lazyExpanderView.js
  129 ../modules/views/html/a5/decorators.js
  195 ../modules/views/html/a5/node-panelView.js
  208 ../modules/views/html/a5/job-progressLineView.js
   70 ../modules/views/html/a5/object-autoView.js
   26 ../modules/views/html/a5/project-editView.js
   42 ../modules/views/html/primitive/number-labeledSlider.js
  231 ../modules/views/html/primitive/primitives.js
   64 ../modules/views/html/primitive/object-autoJobButtonView.js
   93 ../modules/views/html/primitive/selectable-comboBoxView.js
    1 ../modules/views/html/primitive/string-editView.js
    1 ../modules/views/html/primitive/number-editView.js
  190 ../modules/views/html/primitive/decorators.js
  103 ../modules/views/html/primitive/job-buttonView.js
    1 ../modules/views/html/line/file-lineView.js
    1 ../modules/views/html/line/job-lineView.js
   18 ../modules/views/html/line/object-appendView.js
   43 ../modules/views/html/line/object-autoView.js
 2691 total
  341 ../src/mvj.js
  109 ../src/config.js
   50 ../src/q.js
  157 ../src/tools.js
   93 ../src/views/view.js
  258 ../src/views/html/client.js
  115 ../src/app.js
  105 ../src/sim.js
  416 ../src/job/job.js
  192 ../src/job/workflows.js
  172 ../src/job/toolJobs.js
   97 ../src/network/nodeWs.js
   74 ../src/network/browserWs.js
   60 ../src/messages.js
 2239 total



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
