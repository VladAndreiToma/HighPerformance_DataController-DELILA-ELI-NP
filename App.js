import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./MainLayout";

import Interogation from "./components/Interogation";
import Visuals from "./components/Visuals";
import Monitor from "./components/Monitor";
import Timing from "./components/Timing";
import GrafanaCAEN from "./components/GrafanaCAEN";
import Digitizers from "./components/Digitizers";
import ExportLogs from "./components/ExportLogs";
import Sourcing from "./components/Sourcing";
import MakePage from "./components/MakePage";

import "./App.css";
import { flushSync } from "react-dom";
import { useState , useRef , useEffect } from "react";
import Grafana_Main from "./components/GrafanaMain";

function MainApp() {

  const [ theServerLink_Parameter , SET_theServerLink_Parameter ] = useState( "http://172.18.6.59:8080" );
  const [ theServerResponse_Parameter , SET_theServerResponse_Parameter ] = useState( "" ); 
  const [ theBoardsConfiguration_Parameter , SET_theBoardsConfiguration_Parameter ] = useState( [] );
  const [ theChannelsAssociated_Parameter , SET_theChannelsAssociated_Parameter ] = useState( [] );
  const [ theTotalArrayOfHistograms_Parameter , SET_theTotalArrayOfHistograms_Parameter ] = useState( [] );
 
  const [ theRowsInGrid_Parameter , SET_theRowsInGrid_Parameter ] = useState( 4 );  // default integer 5
  const [ theColsInGrid_Parameter , SET_theColsInGrid_Parameter ] = useState( 4 );  // default integer 5
 
  const [ theHoursInRefresh_Parameter , SET_theHoursInRefresh_Parameter ] = useState( 0 );  // default integer to 0h
  const [ theMinutesInRefresh_Parameter , SET_theMinutesInRefresh_Parameter ] = useState( 0 ); // default integer to 0mins
  const [ theSecondsInRefresh_Parameter , SET_theSecondsInRefresh_Parameter ] = useState( 10 );  // default integer to 10s 

  // histograms visual parameters
  let [ statePolyLine , setStatePolyLine ] = useState( true );
  let [ stateCurvyLine , setStateCurvyLine ] = useState( false );
  let [ stateScatterLine , setStateScatterLine ] = useState( false );

  let [ fillState , setFillState ] = useState( false );
  let [ fillColor , setFillColor ] = useState( 'black' );

  let [ lineColor , setLineColor ] = useState( 'black' );

  let [ lineWidth , setLineWidth ] = useState( 1 );

  let [ histoScale , setHistoScale ] = useState( 'linear' );

  // a state ojbect which will be used for retaining here the stuff i want to render based on user conditionals
  let [ theArrayToBeRouted , SET_theArrayToBeRouted ] = useState( [] );  // array state

  // function to set the array state parsed after as prep to monitor called in monitor with new value and also called here
  // make it respond synchronous
  function prep_SET_theArrayToBeRouted( newRoutableArray ){
      SET_theArrayToBeRouted( newRoutableArray );
  }

  // functions to set parameters in interrogation ------------------------------------------------------
  function prep_SET_TheServerLink( newServerLink ){
    flushSync( () =>{
      SET_theServerLink_Parameter( newServerLink );
    } )
  }
  function prep_SET_TheServerResponse( newServerResponse ){
    flushSync( () => { 
      SET_theServerResponse_Parameter( newServerResponse );
    } )
  }
  function prep_SET_TheBoardsConfiguration( newBoardsConfiguration ){
    flushSync(()=>{
      SET_theBoardsConfiguration_Parameter( newBoardsConfiguration );
    } );
  }
  function prep_SET_TheChannelsAssociated( newChannelsAssociated ){
    flushSync( () => {
      SET_theChannelsAssociated_Parameter( newChannelsAssociated );
    } )
  }
  function prep_SET_theToalArrayOfHistograms( newArrayOfHistos ){
    flushSync( () => {
      SET_theTotalArrayOfHistograms_Parameter( newArrayOfHistos );
    } )
  }

  // fucntions to set parameters in visuals settings -----------------------------------------------------
  function prep_SET_theRows( newRows ){
    flushSync( () => {
      SET_theRowsInGrid_Parameter( newRows );
    } );
  }
  function prep_SET_theCols( newCols ){
    flushSync( () => {
      SET_theColsInGrid_Parameter( newCols );
    } );
  }

  // functions to set parameters in timing settings -------------------------------------------------------
  function prep_SET_theHours( newHours ){
    flushSync( () => { 
      SET_theHoursInRefresh_Parameter( newHours );
    } );
  }
  function prep_SET_theMinutes( newMinutes ){
    flushSync( () => {
      SET_theMinutesInRefresh_Parameter( newMinutes );
    } );
  }
  function prep_SET_theSeconds( newSeconds ){
    flushSync( () => {
      SET_theSecondsInRefresh_Parameter( newSeconds );
    } );
  }

  // send values of interest as props to the monitor component
{ /*just for checking purposes =========================================================================================*/ }
  // lets see if stuff is changing here in main app
  useEffect( () => {

    if( theRowsInGrid_Parameter || theColsInGrid_Parameter ){
      //console . log( "in main app rows: " , theRowsInGrid_Parameter );
      //console . log( "in main app cols: " , theColsInGrid_Parameter );

      //console . log( "in main app hours / mins/ seconds set by user: " + theHoursInRefresh_Parameter , " " , theMinutesInRefresh_Parameter , "  " , theSecondsInRefresh_Parameter );
      //console . log( "top level ap[p: " , statePolyLine , stateCurvyLine , stateScatterLine );
      //console . log( "fill state / fill color in main app: " , fillState , fillColor , lineColor , lineWidth );
    
      console . log( theTotalArrayOfHistograms_Parameter );
      console . log( theBoardsConfiguration_Parameter );
      console . log( theChannelsAssociated_Parameter );
      console . log( "the histo scale: " , histoScale );
    }

  } , [ theServerLink_Parameter , theServerResponse_Parameter , theBoardsConfiguration_Parameter ,
      theChannelsAssociated_Parameter , theTotalArrayOfHistograms_Parameter , theHoursInRefresh_Parameter , 
      theMinutesInRefresh_Parameter , theSecondsInRefresh_Parameter , theRowsInGrid_Parameter , theColsInGrid_Parameter
      , stateCurvyLine , stateScatterLine , statePolyLine , fillState , fillColor , lineColor , lineWidth
      , histoScale
    ] );
{ /*  =========================================================================================================== */ }

  useEffect(() => {} , [ theArrayToBeRouted ])


  // renedering the lookk of the page ---> this []
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<MainLayout />} />
        
        <Route path="/interogation" element={<Interogation fSetServerResponse ={ prep_SET_TheServerResponse } 
          fSetServerLink = { prep_SET_TheServerLink } fSetBoards = { prep_SET_TheBoardsConfiguration } 
          fSetChannels = { prep_SET_TheChannelsAssociated } fSetArrayOfHistograms = { prep_SET_theToalArrayOfHistograms } />} />

        <Route path="/visuals" element={<Visuals fPolyLine = { setStatePolyLine }  fScatterLine = { setStateScatterLine } 
          fCurvyLine = { setStateCurvyLine }  fSetTheRows = { prep_SET_theRows } fSetTheCols = { prep_SET_theCols } 
          fFillState = { setFillState } fFillColor = { setFillColor } fLineColor = { setLineColor } 
          fLineWidth = { setLineWidth }  setScale = { setHistoScale }/>} />
        
        <Route path="/timing" element={<Timing  fSetHours = { prep_SET_theHours } fSetMinutes = { prep_SET_theMinutes } fSetSeconds = { prep_SET_theSeconds } />} />
        
        <Route path="/monitor/*" element={ <Monitor pExperimentArray={theTotalArrayOfHistograms_Parameter} 
                  pRowsGrid={theRowsInGrid_Parameter} pColsGrid={theColsInGrid_Parameter} pHoursRefresh={theHoursInRefresh_Parameter}
                  pMinutesRefresh={theMinutesInRefresh_Parameter} pSecondsRefresh={theSecondsInRefresh_Parameter}
                  pBoards={theBoardsConfiguration_Parameter}  fArrayToRoute = { prep_SET_theArrayToBeRouted }  
                  pServerLink = {theServerLink_Parameter } 
                  qPoly = { statePolyLine } qCurvy = { stateCurvyLine } qScatter ={ stateScatterLine } 
                  qFillState = { fillState } qFillColor ={ fillColor } qLineColor = { lineColor } qLineWidth = { lineWidth }
                  histoScale = { histoScale } />} />
        
        <Route path="/grafana/*" element={<Grafana_Main />}/>
      
        <Route path="/digitizers" element={<Digitizers />}/>

        <Route path="/export-logs" element={<ExportLogs />}/>

        <Route path="/sourcing" element={<Sourcing />}/> 

      </Routes>
    </Router>
  );
}

export default MainApp;
