# bacc
- refactorings
    - job api refactoring
    - logic refactoring
        - recovery
        - dag nondag
        - logic and/or/whatever
- bugs
    - syncbug
    - no termination bug
    - double return bug

//----------------------------------------------------------------

## folderstrucure (todo)
- bin
- doc
- log
- res
    - bin
    - dat
    - img
    - prj
- src

//----------------------------------------------------------------

## nach bacc
- tests
- command line
- bigobject
    - object member order/arrays
    - persitance
        - types, views, css editierbar
        - code edit
        - view edit/wysiwyg
        - long list support
    - graph edit
        - filemanager /rm/mv
        - dnd
    - publish subscribe
        - mvj refactoring
        - updateflush
    - lazy view
- spark api
- meta packet manager apt/npm/pip/cmake...
- real hirachical net
- webrtc network
    - 2p2
    - stream

//----------------------------------------------------------------

## module
- network
- job
    - job
    - job handlers (tools und logic)
- dynamic ajaj
- mvj/bigobject?

//----------------------------------------------------------------

table layout fill last
http://codepen.io/shanomurphy/pen/jbPMLX

<div class="layout">
  <div class="layout__row" >
    <div class="layout__cell" id = 'a'>
      Row 1 content
    </div>
  </div>
  <div class="layout__row" >
    <div class="layout__cell" id = 'a'>
      Row 1 content
    </div>
  </div>
  <div class="layout__row">
    <div class="layout__cell" id ='b'>
      Row 2 fills remaining vertical space without needing to know row 1 height.
    </div>
  </div>
</div>

//----------------------------------------------------------------

html, body { height: 100%; // required to make .layout 100% height }

.paper {         // aber auch der expander content ?
  display: table;
  width: 100%;
  height: 100%;
}

.a3expander__row {
  display: table-row;
}

.a3expander__row:last-child {
  display: table-row;
  height: 100%;
}

.a3expander__cell {
  display: table-cell;
}

/* Non essential example styles */

body { text-align: center; }
#b { background: pink; }
#a { background: yellow; }


