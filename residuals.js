// content creation with template literal approach
function ContentCreation( SL , usageData , pageNo , rows , cols , h , m , s ){

    let theServerLink = SL;
    let paginationRows = rows;
    let paginationCols = cols;
    let totalTime = ( h*3600 + m*60 + s );
    let pageContent = usageData[1];
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
            }
            
            .draggable {
              width: auto;
              height: auto;
              border: 2px solid rgba(255, 0, 0, 0.5);
              border-radius: 3px;
              cursor: move;
            }

            #rootDiv {
              display: grid;
              grid-template-columns: repeat(var(--cols), minmax(550px, 1fr));
              grid-template-rows: repeat(var(--rows), minmax(450px, 1fr));
              gap: 1px;
              width: 100%;
              height: 100%; /* Fill the remaining space below the header */
              overflow: auto; /* Allow scrolling inside rootDiv if content overflows */
            }

            #header {
              display: flex; /* Corrected typo here */
              background-color: rgba(50, 50, 50, 0.7);
              height: 10%; /* Or a fixed height like '80px' */
              width: 100%;
              justify-content: center;
              align-items: center;
            }
          </style>
        <head>

        <body>
            <div id="header">
              <label style="color: rgba(250,250,250,0.8); font-family: monospace; font-size: 28px; font-weight: bold">Monitor Page${pageNo}.Options: grid(${rows}by${cols}), refreshTime: ${h}h:${m}min:${s}s<label>
            </div>
            <div id="rootDiv">
            </div>
            <script type="module">
              import { draw, gStyle, redraw, create, httpRequest , parse } from 'https://root.cern/js/latest/modules/main.mjs';

              document . getElementById( 'rootDiv' ) . style . backgroundColor = 'rgba(50,50,50,0.7)';

              // make the div rescalable depending on the dimension of the input -> better ui experience

              function SetGrid( r , c ){
                document . getElementById( 'rootDiv' ) . style . setProperty( '--rows' , r );
                document . getElementById( 'rootDiv' ) . style . setProperty( '--cols' , c );
              }
                
              SetGrid( ${paginationRows} , ${paginationCols} );

              // Create divs for histograms
              let containersLimit = ( ${paginationRows} * ${paginationCols} > ${usageData[1].length} ) ? ${usageData[1].length} : ${paginationCols} * ${paginationRows}; 
              // decide upon limit , if its less make less grid


              for ( let index = 0 ; index < containersLimit ; index++ ) {
                let divForHisto = document.createElement('div');
                divForHisto.id = 'divFor' + index;
                /*
                divForHisto . style . padding = '1px';
                divForHisto . style . border = '2px solid';
                divForHisto . style . borderColor = 'rgba(255, 0, 0, 0.5)';
                divForHisto . style . borderRadius = '5px';
                */
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

              let globalMax = 0;
              let globalMin = 0;

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
                          histo . fName = 'Histo' + commonIndex;
                          //console . log( "for: " + histo . fName + "ranges x: " + 
                          //histo . fXaxis . fXmin + "-" + histo . fXaxis . fXmax );
                          globalMax = histo . fXaxis . fXmax;
                          globalMin = histo . fXaxis . fXmin;
                          console . log( globalMin , globalMax );
                          draw( divElement , histo , 'hist');
                        }

                        // Set interval to update the same div
                        let intervalID = setInterval(async () => {
                          const Cjson = await httpRequest('${theServerLink}' + histoName + '${extension}', 'object');
                          let histo = parse( Cjson );
                          if( Cjson && histo ) {
                            histo.fLineColor = 2; // Red color
                            histo.fLineWidth = 2; // Bigger line
                            histo . fXaxis . SetRange( globalMin , globalMax );
                            redraw(divElement, histo , 'hist');
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






















/*
function chunkArray(array, chunkSize) {
    return array.reduce((result, item, index) => {
      const chunkIndex = Math.floor(index / chunkSize);
      if (!result[chunkIndex]) {
        result[chunkIndex] = []; // start a new chunk
      }
      result[chunkIndex].push(item);
      return result;
    }, []);
  }

  function MakePage({ items, boardId }) {
    return (
      <div>
        <h3>Board {boardId}</h3>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Router>
      <div id="monitor_div" className="menu_divs" style={{ background: `url(${menuBG})` }}>
        <div id="monitor_content" className="content4Feature" ref={refToMonitorContent}>
          {ConditionalRender()}

          <div>
            <h2>Available Boards:</h2>
            <ul>
              {Object.keys(Boards_Dictionary).map((boardId) => (
                <li key={boardId}>
                  <Link to={`/monitor/board/${boardId}`}>Board {boardId}</Link>
                </li>
              ))}
            </ul>
          </div>

          <Routes>
            <Route path="/" element={<div>Welcome to the Monitor. Select a board to view details.</div>} />
            {Object.keys(Boards_Dictionary).map((boardId) => {
              const chunks = chunkArray(Boards_Dictionary[boardId], maxItemsPerPage);
              return chunks.map((chunk, index) => (
                <Route
                  key={`${boardId}-${index}`}
                  path={`/monitor/board/${boardId}/page/${index + 1}`}
                  element={<MakePage items={chunk} boardId={boardId} />}
                />
              ));
            })}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
*/