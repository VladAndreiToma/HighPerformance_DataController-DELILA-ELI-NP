import React from "react";
import { useState , useEffect , useRef } from "react"; 
import menuBG from "./menuBG.jpg";
import { Link , BrowserRouter as Router , Routes , Route , Outlet } from "react-router-dom";
import { PlotWithPlotly } from "./PlotWithPlotly";
import MakePage from "./MakePage";
import { flushSync } from "react-dom";
import CastPage from "./CastPage";


function Monitor({ 
    pExperimentArray, pRowsGrid, pColsGrid, pHoursRefresh, 
    pMinutesRefresh, pSecondsRefresh, pBoards, pServerLink,
    qPoly, qCurvy, qScatter, qFillState, qFillColor, qLineColor, qLineWidth , histoScale 
}) {
    const [Array_With_Data_For_Route, setArray_With_Data_For_Route] = useState([]);
    const refToMonitorContent = useRef(null);

    pServerLink = pServerLink . includes( '/h.json' ) ? pServerLink . replace( '/h.json' , '' ) : pServerLink; 
    console.log(pServerLink, pRowsGrid, pColsGrid);

    useEffect(() => {
        const fetchExpJSON = async () => {
            try {
                let promise = await fetch(pServerLink + '/h.json');
                let expJSON = await promise.json();
                console.log(expJSON);
    
                const createChannelPairs = (jsonData, rows, cols) => {
                    const channelPairs = [];
                    const totalChannelsInGrid = rows * cols;
                  
                    jsonData._childs.forEach(board => {
                        if (board._kind === 'ROOT.TFolder') {
                            const channels = [];
                            // Collect channel numbers from board
                            board._childs.forEach(channel => {
                                if (channel._name.includes('hist')) {
                                    const channelNumber = parseInt(channel._name.split('_')[1], 10);
                                    channels.push(channelNumber < 10 ? `Ch0${channelNumber}` : `Ch${channelNumber}`);
                                }
                            });
    
                            // Chunk channels based on totalChannelsInGrid
                            for (let i = 0; i < channels.length; i += totalChannelsInGrid) {
                                const chunk = channels.slice(i, i + totalChannelsInGrid);
                        
                                if (chunk.length > 0) {
                                    const firstChannel = chunk[0];
                                    const lastChannel = chunk[chunk.length - 1];
                                    channelPairs.push([board._name, `${firstChannel}`, `${lastChannel}`]);
                                }
                            }
                        }
                    });
    
                    return channelPairs;
                };
              
                // Create channel pairs and set state
                const newData = createChannelPairs(expJSON, pRowsGrid, pColsGrid);
                setArray_With_Data_For_Route(newData);
                console.log(newData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        fetchExpJSON();
    }, [pServerLink, pRowsGrid, pColsGrid]); // No need to include Array_With_Data_For_Route

    useEffect(()=>{
        console . log( "histo scale passed to monitor is: " , histoScale );
    } , [histoScale])

    return (
        <div id='monitor_div' className='menu_divs' style={{ background: `url(${menuBG})` }}>
            <div id='monitor_content' className='monitorContent' ref={refToMonitorContent}>
                {Array_With_Data_For_Route.length === 0 ? (
                    <div style={{ width: '100%', height: '100%', display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                        <label>Data server has not been interrogated yet<br />
                        Please provide a valid URL for server interrogation<br />
                        That is your DAQ server<br />
                        In the 'Interrogation' region.</label>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', padding: '5px 10px', flexDirection: 'row', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '300px', maxWidth: '33%', height: '95%', overflowY: 'scroll', padding: '10px' }}>
                            <label>Histogram data</label>
                            {Array_With_Data_For_Route.map((data, index) => (
                                <Link key={index} className="standard_link_pages" to={`/monitor/${data[0]}?nobrowser&what=hist&layout=grid${pRowsGrid}x${pColsGrid}&channels=${data[1]}-${data[2]}&pHours=${pHoursRefresh}&pMinutes=${pMinutesRefresh}&pSeconds=${pSecondsRefresh}&scaleYAxis=${histoScale}&fillColor=${qFillColor}&fillState=${qFillState}&lineColor=${qLineColor}&lineSize=${qLineWidth}`}>
                                    <span style={{ fontSize: '34px', fontWeight: 'bold' }}>↗</span>
                                    PageNo{index+1}/{data[0]}/({data[1]}-{data[2]})
                                </Link>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '300px', maxWidth: '33%', height: '95%', overflowY: 'scroll', padding: '10px' }}>
                            <label>ADC data</label>
                            {Array_With_Data_For_Route.map((data, index) => (
                                <Link key={index} className="standard_link_pages"
                                      to={`/monitor/${data[0]}?nobrowser&what=ADC&layout=grid${pRowsGrid}x${pColsGrid}&channels=${data[1]}-${data[2]}&pHours=${pHoursRefresh}&pMinutes=${pMinutesRefresh}&pSeconds=${pSecondsRefresh}&scaleYAxis=${histoScale}&fillColor=${qFillColor}&fillState=${qFillState}&lineColor=${qLineColor}&lineSize=${qLineWidth}`}>
                                    <span style={{ fontSize: '34px', fontWeight: 'bold' }}>↗</span>
                                    PageNo{index+1}/{data[0]}/({data[1]}-{data[2]})
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
      
      {/* Render Routes Here */}
      <Routes>
          {
              Array_With_Data_For_Route.map(( data , index) => (
                  <Route key={index} path={`/:board`} element={<CastPage pageArray={data[1]} rows={ pRowsGrid } cols = { pColsGrid } 
                  hours = { pHoursRefresh } minutes = { pMinutesRefresh } seconds = { pSecondsRefresh }  serverLink = { pServerLink } 
                  qCurvy = { qCurvy } qPoly = { qPoly } qScatter= { qScatter } qLineColor = { qLineColor } qLineWidth = { qLineWidth }
                  qFillState= { qFillState } qFillColor = { qFillColor }  boardID = { data[0] } what = { 'hist' }
                  hScale = { histoScale }
                  />} />
                  
              ))
            }
            {
              Array_With_Data_For_Route.map(( data , index) => (
                <Route key={index} path={ `/:board` } element={<CastPage pageArray={data[1]} rows={ pRowsGrid } cols = { pColsGrid } 
                hours = { pHoursRefresh } minutes = { pMinutesRefresh } seconds = { pSecondsRefresh }  serverLink = { pServerLink } 
                qCurvy = { qCurvy } qPoly = { qPoly } qScatter= { qScatter } qLineColor = { qLineColor } qLineWidth = { qLineWidth }
                qFillState= { qFillState } qFillColor = { qFillColor }  boardID = { data[0] } what = { 'adc' }
                hScale = { histoScale }
                />} />
                
            ))
          }
      </Routes>
  </div>
    );
}

export default Monitor;

/*
<div style={{ display: "flex", overflowY: 'scroll' , flexDirection: "column", gap: '5px' }}>
                        {
                            Array_With_Data_For_Route.map((data, index) => (
                                  <Link key={index} className="standard_link_pages" to={`/monitor/visualize-${data[0]}-(${data[2]}-${data[3]})`}>
                                      <span style={{ fontSize: '36px', fontWeight: 'bold' }}>↗</span>Page{index + 1}/{data[0]}/({data[2]}-{data[3]})
                                  </Link>
                            ))
                        }
                    </div>
                    <div style={ { display: 'flex' , flexDirection: 'column' , minWidth: '300px' , maxWidth:'33%' , height: '95%' , overflowY: 'scroll' , padding: '10px' }  }>
                        <label>Histograms for Counts</label>
                        {
                             Array_With_Data_For_Route.map((data, index) => (
                                <Link key={index} className="standard_link_pages" to={`/monitor/visualize-${data[0]}-(${data[2]}-${data[3]})`}>
                                    <span style={{ fontSize: '34px', fontWeight: 'bold' }}>↗</span>Page{index + 1}/{data[0]}/({data[2]}-{data[3]})
                                </Link>
                          ))
                        }
                </div>
                <div style={ { display: 'flex' , flexDirection: 'column' , minWidth: '300px' , maxWidth:'33%' , height: '95%' , overflowY: 'scroll' , padding: '10px' }  }>
                        <label>Histograms for Energy</label>
                        {
                            Array_With_Data_For_Route.map((data, index) => (
                                <Link key={index} className="standard_link_pages" to={`/monitor/visualize-${data[0]}-(${data[2]}-${data[3]})`}>
                                    <span style={{ fontSize: '34px', fontWeight: 'bold' }}>↗</span>Page{index + 1}/{data[0]}/({data[2]}-{data[3]})
                                </Link>
                          ))
                        }
                </div>
                    
                    
                    
                    
                    
                    */






                /*
                 const refToMonitorContent = useRef( null );

    useEffect( () => {
        // empty each time this effect runs
        Boards_Dictionary = {};
        Array_With_Data_For_Route = [];
        for (let BoardId of pBoards) {
            console.log(BoardId);
        
            // Initialize the array for the current BoardId if it doesn't exist
            if (!Boards_Dictionary[BoardId]) {
                Boards_Dictionary[BoardId] = [];
            }
        
            // Extract the board number from 'BoardId', e.g., "Board00" -> "00"
            const boardNumber = BoardId.slice(5); // This will extract "00" from "Board00"
        
            // Find and push elements from pExperimentArray related to the current BoardId
            pExperimentArray.forEach((item) => {
                // Check if the item contains 'hist' followed by the extracted board number (e.g., 'hist00')
                if (item.indexOf('hist' + boardNumber) !== -1) {
                    Boards_Dictionary[BoardId].push(item);
                }
            });
        }
        console . log("i nside the monitor page: dictionary with boards" , Boards_Dictionary );
        console . log( "inside the monitor: pExperiments array" , pExperimentArray );

        let localArrayForRoute = [];

        Object.keys(Boards_Dictionary).forEach((insideKey) => {
            // Iterate over each board's content and chunk it according to the grid size
            for (let indexContentOfBoard = 0; indexContentOfBoard < Boards_Dictionary[insideKey].length; indexContentOfBoard += (pRowsGrid * pColsGrid)) {        
                // Determine the slicing range for the current chunk
                let slicedPart = (indexContentOfBoard + (pRowsGrid * pColsGrid) < Boards_Dictionary[insideKey].length) ?
                                 Boards_Dictionary[insideKey].slice(indexContentOfBoard, indexContentOfBoard + (pColsGrid * pRowsGrid)) :
                                 Boards_Dictionary[insideKey].slice(indexContentOfBoard, Boards_Dictionary[insideKey].length);
                // Regex to match numbers after an underscore
                let regex = /_(\d+)/;
                // Extract the channel numbers for the first and last element in the chunk
                let chInferior = parseInt(slicedPart[0].match(regex)[1], 10);
                let chSuperior = parseInt(slicedPart[slicedPart.length - 1].match(regex)[1], 10);
                // Push the chunk and channel range to localArrayForRoute
                localArrayForRoute.push([insideKey, slicedPart, `ch${chInferior}`, `ch${chSuperior}`]);
            }
        });

        Array_With_Data_For_Route = localArrayForRoute;
        fArrayToRoute( Array_With_Data_For_Route );

    } , [ pExperimentArray , pBoards , pRowsGrid , pColsGrid , pHoursRefresh , pMinutesRefresh , pSecondsRefresh ] );
                */