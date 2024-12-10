import React from "react";
import { useLocation } from "react-router-dom";
import { useState , useEffect , useRef } from "react";
import bgimg from "./MakePageBG.jpg";

function MakePage( { data , array } ){
    //console . log ( "make page data: " , data );
    //console . log( "make page array: " , array );

    let pageContent = data[1];

    const content = `
        <!DOCTYPE html>
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
                    .draggable {
                        width: auto;
                        height: auto;
                        border-radius: 3px;
                        cursor: move;
                        border: 2px solid red;
                    }
                </style>
            </head>
            <body>
                <div id='rootDiv'>
                </div>
            </body>
            <script type="module">
              import { draw, gStyle, redraw, create, httpRequest , parse } from 'https://root.cern/js/latest/modules/main.mjs';

              // make the div rescalable depending on the dimension of the input -> better ui experience

              function SetGrid( r , c ){
                document . getElementById( 'rootDiv' ) . style . setProperty( '--rows' , r );
                document . getElementById( 'rootDiv' ) . style . setProperty( '--cols' , c );
              }
                
              SetGrid( ${5} , ${5} );

              // Create divs for histograms
              let containersLimit = ( ${5} * ${5} > ${pageContent.length} ) ? ${pageContent.length} : ${5} * ${5}; 
              // decide upon limit , if its less make less grid


              for ( let index = 0 ; index < containersLimit ; index++ ) {
                let divForHisto = document.createElement('div');
                divForHisto.id = 'divFor' + index;
                divForHisto . className = 'draggable';
                document.getElementById('rootDiv').appendChild(divForHisto);
              }
            </script>
        </html>
    `;

    // Return the component with the injected HTML
    return (
        <div
            dangerouslySetInnerHTML={{ __html: content }}
            id="MakePageRootDiv"
            className="menu_divs"
            style={{ background: `url(${bgimg})` }}
        >
        </div>
    );
}
export default MakePage;