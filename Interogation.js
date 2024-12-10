import React from "react";
import { useRef , useState , useEffect } from "react";
import menuBG from './menuBG.jpg';

function Interogation( { fSetServerResponse , fSetServerLink , fSetBoards , fSetChannels , fSetArrayOfHistograms } ){

    const refToServerInputField = useRef( null );
    const refToServerResponseField = useRef( null );
    const refToHowManyBoards = useRef( null );
    const refToHowManyChannels = useRef( null );

    async function HandleServerInterogation(){
        let doesServerHaveJSON;
        refToServerInputField . current . value . trim() . lastIndexOf( 'h.json' ) !== -1 ? doesServerHaveJSON = '' : doesServerHaveJSON = 'h.json';
        refToServerInputField . current . value = refToServerInputField . current . value . trim() + doesServerHaveJSON;
  
        fSetServerLink( refToServerInputField . current . value . trim() );  // set the link flag
  
        try{
          let theResponseFromServer = await fetch( refToServerInputField . current . value . trim() );  // i fetch from server address
          if( !theResponseFromServer . ok ){
            throw new Error( 'Something wrong with network response' );
          }
          // i retrieve the data in JSON format
          const retrievedData_JSONformat = await theResponseFromServer . json();  // from the response await for the json conversion format of data also make state for the total array -> useful later
          // i check if everything is ok with the data and if i have it
          if( retrievedData_JSONformat ){
            // everything is ok and data exists thus
            refToServerResponseField . current . value = 'Server Connection - SUCCESS. Configuration is retrieved';
            fSetServerResponse( "Server retrieval: SUCCESS" );   // -> set here so i can se in parent
            // lets check if the data is having children
            if( !( retrievedData_JSONformat . _childs && retrievedData_JSONformat . _childs . length > 0 ) ){
              alert( 'The retrieved json is emtpy and is not having first degree children' );
            }else{
              let theNamesOfHistograms = [];   // array like structure
              let theBoards = {};   // dictionary like structure
              // local cause they will be dropped after usage. With them i ll populate the flag state parameters in parent directory
              // i go over the nested children structure of the json and check for names
              retrievedData_JSONformat._childs.forEach(firstChildOfJSON => {
                if (firstChildOfJSON._kind === 'ROOT.TFolder' && firstChildOfJSON._childs) {
                    // Process each child of the folder
                    firstChildOfJSON._childs.forEach(histogramChild => {
                        if (histogramChild._kind === 'ROOT.TH1D') {
                            // Adjusted regex for names like hist03_02
                            const HistogramObjectMatcher = histogramChild._name.match(/hist(\d+)_([0-9]+)/);
                            
                            if (HistogramObjectMatcher) {
                                // Add histogram name to the list
                                theNamesOfHistograms.push(histogramChild._name);
            
                                // Extract board and channel numbers
                                let boardNo = HistogramObjectMatcher[1];
                                let channelNo = HistogramObjectMatcher[2];
            
                                // Initialize the board entry if not present
                                if (!theBoards[boardNo]) {
                                    theBoards[boardNo] = [];
                                }
            
                                // Add channel number to the board entry
                                theBoards[boardNo].push(channelNo);
                            }
                        }
                    });
                }
            });
              // i finished the stepping over the whole retrieved data    so i make synchronous set function for the histograms
              fSetArrayOfHistograms( theNamesOfHistograms );
              // ok now i have the histograms names list which i should be able at this stage to see in the parent App.js
              // further on to extract the number of channels i need to get the length of boardNo location in the boards  so i ll use reduce which is a remaping array function
              const channelsCountedForEachBoard = Object . keys( theBoards ) . reduce( ( shortedVersion , boardNo ) => { 
                shortedVersion[ boardNo ] = theBoards[ boardNo ] . length;
                return shortedVersion;
              } , {} );
              // i extend using object primitives the dictionary{} inside the the variable and for each entry of the boards which is board number i assign in the new dictionary the entry with the same board no and the element stored will be the length which is indeed the total number of channels for that board
              // to make array of array i want to extract keys and values independently
              let theKeysInReducedDictionary = Object . keys( channelsCountedForEachBoard ); // primitive extractor function for keys
              let theValuesInReducedDictionary = Object . values( channelsCountedForEachBoard ); // primitive extractor for values
  
              // put mapped version into the corresponding input fields 
              let mappedBoards = theKeysInReducedDictionary . map( ( key ) => `Board${key}` );
              let mappedChannels = theKeysInReducedDictionary . map( ( key , index ) => `[B${key}-${theValuesInReducedDictionary[index]}ch]` );
          
  
              // set and display accordingly
              refToHowManyBoards . current . rows = Math . ceil( mappedBoards . length / 2 ) - 1;
              refToHowManyBoards . current . cols = 1;  // is in terms of elements which is one string
              refToHowManyChannels . current . rows = Math . ceil( mappedChannels . length ) - 1;
              refToHowManyChannels . current . cols = 1; // in terms of elements which is again one string
              
              refToHowManyBoards . current . value = '[' + mappedBoards + ']';
              fSetBoards( mappedBoards );
              refToHowManyChannels . current . value = "[" + mappedChannels + "]";
              fSetChannels( mappedChannels );
            
            }
          }
        }catch ( err ){
          alert( err . message );
          refToServerInputField . current . value = `Something wrong with server: ${ err . message }`;
        }
    }

    return(
        <div id='interogation_div' className="menu_divs" style={{ background: `url(${menuBG})` }}>
             <div id='interogate_content' className='content4Feature'>
                Interogate your D.Aq. server.<br/>
                This step will extract experiment's configuration.<br/>
                You will retrieve the number of boards,<br/>
                and the channels for each board.
                <div style={ { justifyContent: 'center',  alignItems: 'center' }}>  
                    <input type='text' ref={ refToServerInputField } className='link_to_server_input' placeholder='Type server url here...' ></input>
                    <button id='interogate_server' className='button4Server' onClick={ HandleServerInterogation }>➤</button>
                </div>
                Server response:
                <div style={ { justifyContent: 'center',  alignItems: 'center', marginBottom: '10px' } }>
                    <input type='text' ref={ refToServerResponseField }  readOnly={true} className='link_to_server_input' style={{ cursor: 'pointer' }} placeholder='connection/retrieval status'></input>
                </div>
                You have in your configuration:
                <div style={{ justifyContent: 'center',  alignItems: 'flex-start', display: 'flex', flexDirection:'column' , gap: '10px' }}>
                    <input type="text" ref={ refToHowManyBoards }  readOnly={true} className='link_to_server_response' style={{ cursor: 'pointer' }} placeholder='Board`No` as list'></input>
                    <input type="text" ref={ refToHowManyChannels }   readOnly={true} className='link_to_server_response' style={{ cursor: 'pointer' }} placeholder='Board`No` with `No` channels as list'></input>
                </div>
            </div>
        </div>
    )
}

export default Interogation;