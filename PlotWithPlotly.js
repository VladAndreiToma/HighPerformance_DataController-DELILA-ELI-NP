export function PlotWithPlotly(link, data, index, rows, cols, h, m, s) {
    
    let theServerLink = link;
    let paginationRows = rows;
    let paginationCols = cols;
    let totalTime = ( h*3600 + m*60 + s );
    let pageContent = data[1];
    theServerLink = theServerLink . includes( 'h.json' ) ? theServerLink . replace( 'h.json' , '' ) : theServerLink;
    const extension = '/root.json';

    return(
      `<!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              height: 100vh; /* Ensure the body takes up the full viewport height */
              display: flex;
              flex-direction: column;
              width: 100vw; /* Ensure the body takes up the full viewport width */
              overflow: hidden; /* Prevent scrollbars on the body */
              background-color: #333333;
            }
            
            .draggable {
              width: auto;
              height: auto;
              border-radius: 3px;
              cursor: move;
            }

            #rootDiv {
              display: grid;
              grid-template-columns: repeat(var(--cols), minmax(550px, 1fr));
              grid-template-rows: repeat(var(--rows), minmax(450px, 1fr));
              gap: 5px;
              width: 100%;
              height: 100%; /* Fill the remaining space below the header */
              overflow: auto; /* Allow scrolling inside rootDiv if content overflows */
              padding: 0px;
            }

            #header {
              display: flex; /* Corrected typo here */
              height: 10%; /* Or a fixed height like '80px' */
              width: 100%;
              justify-content: center;
              align-items: center;
            }
          </style>
        <head>

        <body>
            <div id="header">
              <label style="color: rgba(250,250,250,0.8); font-family: monospace; font-size: 28px; font-weight: bold">Monitor Page${index+1}: ${data[0]}(${data[2]}-${data[3]}).Options: grid(${rows}by${cols}), refreshTime: ${h}h:${m}min:${s}s<label>
            </div>
            <div id="rootDiv">
            </div>
            <script type="module">
              import { draw, gStyle, redraw, create, httpRequest , parse } from 'https://root.cern/js/latest/modules/main.mjs';

              // make the div rescalable depending on the dimension of the input -> better ui experience

              function SetGrid( r , c ){
                document . getElementById( 'rootDiv' ) . style . setProperty( '--rows' , r );
                document . getElementById( 'rootDiv' ) . style . setProperty( '--cols' , c );
              }
                
              SetGrid( ${paginationRows} , ${paginationCols} );

              // Create divs for histograms
              let containersLimit = ( ${paginationRows} * ${paginationCols} > ${pageContent.length} ) ? ${pageContent.length} : ${paginationCols} * ${paginationRows}; 
              // decide upon limit , if its less make less grid


              for ( let index = 0 ; index < containersLimit ; index++ ) {
                let divForHisto = document.createElement('div');
                divForHisto.id = 'divFor' + index;
                divForHisto . className = 'draggable';
                document.getElementById('rootDiv').appendChild(divForHisto);
              }

              function makeDraggable(element) {
                  let isDragging = false;
                  let startX, startY;
                  let initialLeft, initialTop;

                  // Set initial positions if not already set
                  if (!element.dataset.initialLeft) {
                      element.dataset.initialLeft = element.style.left || '0px';
                  }
                  if (!element.dataset.initialTop) {
                      element.dataset.initialTop = element.style.top || '0px';
                  }

                  element.addEventListener('mousedown', (e) => {
                      isDragging = true;
                      startX = e.clientX;
                      startY = e.clientY;
                      initialLeft = parseInt(element.dataset.initialLeft, 10);
                      initialTop = parseInt(element.dataset.initialTop, 10);
                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', onMouseUp);
                  });

                  function onMouseMove(e) {
                      if (isDragging) {
                          let deltaX = e.clientX - startX;
                          let deltaY = e.clientY - startY;

                          element.style.left = ( initialLeft + deltaX ) . toString() + 'px';
                          element.style.top = ( initialTop + deltaY ) . toString() + 'px';
                      }
                  }

                  function onMouseUp() {
                      isDragging = false;
                      element.dataset.initialLeft = element.style.left; // Save the new position
                      element.dataset.initialTop = element.style.top;   // Save the new position
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                  }
              }

              // Apply the draggable functionality to all elements with class 'draggable'
              document.querySelectorAll('.draggable').forEach(makeDraggable);
                  
              // Set properties of all histograms
              (async () => {
                try {
                  let commonIndex = 0;
                  for (let histoName of ${JSON.stringify(pageContent)}) {
                    if (commonIndex < containersLimit ) {
                      let divId = 'divFor' + commonIndex;
                      let divElement = document.getElementById(divId);
                      if ( divElement ){
                        let ICjson = await httpRequest('${theServerLink}' + histoName + '${extension}', 'object');
                        let histo = parse( ICjson );
                        if (ICjson && histo) {
                          histo.fLineColor = 2; // Red
                          histo.fLineWidth = 2; // Line Width (fixed typo here)
                         // histo.fFillColor = 2; // red fill
                          histo . fName = 'Histo' + commonIndex;
                          
                          draw( divElement , histo , 'hist' );
                        }

                        // Set interval to update the same div
                        let intervalID = setInterval(async () => {
                          const Cjson = await httpRequest('${theServerLink}' + histoName + '${extension}', 'object');
                          let histo = parse( Cjson );
                          if( Cjson && histo ) {
                            histo.fLineColor = 2; // Red color
                            histo.fLineWidth = 2; // Bigger line
                      //      histo . fFillColor = 2;
                            redraw( divElement , histo , 'hist' );
                          }
                        }, ${totalTime * 1000});
                      }
                      commonIndex++;
                    }
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              })();
            </script>
        </body>
        </html>
      `);
}