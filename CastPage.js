import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import bg from "./MakePageBG.jpg";
import * as JSROOT from 'jsroot';

import { draw, gPad, gStyle, redraw, create, httpRequest , parse } from 'https://root.cern/js/latest/modules/main.mjs';

import { useParams , useLocation } from "react-router-dom";


export default function CastPage( { pageArray , serverLink,
    qCurvy , qPoly , qScatter , rows , cols , hScale , qLineColor , qLineWidth , qFillState , qFillColor , what } ){

    let divNum = 0;
    
    console . log( 'inherited histo scale is: ' , hScale );

    what === 'adc' ? what = 'ADC' : what = 'hist';

    const location = useLocation();
    const {board} = useParams();
    const query = new URLSearchParams( location . search );
    let layout = query . get( 'layout' );
    let channels = query . get( 'channels' );
    let hours = parseInt( query . get( 'pHours' ));
    let minutes = parseInt( query . get( 'pMinutes' ));
    let seconds = parseInt(query . get( 'pSeconds' ));
    what = query . get( 'what' );
    hScale = query . get( 'scaleYAxis' );
    qLineColor = query . get( 'lineColor' );
    qLineWidth = query . get( 'lineSize' );
    qFillColor = query . get( 'fillColor' );
    qFillState = query . get( 'fillState' );

    layout . includes( 'grid' ) ? layout = layout . replace( 'grid' , '' ) : layout = layout;
    let Rows = parseInt( layout . split('x')[0] );
    let Cols = parseInt( layout . split('x')[1] );
    
    let inferiorCh = parseInt( channels . split('-')[0] . replace('Ch','') );
    let superiorCh = parseInt( channels . split( '-' )[1] . replace('Ch','') );

    function generateObjects( type ){
        const objects = [];

        for (let index = inferiorCh; index <= superiorCh; index++) {
            // Format the channel number as '00', '01', etc.
            const channelFormatted = index < 10 ? `0${index}` : `${index}`;
            //console . log( channelFormatted );
            let brdIndex = board . replace( 'Brd' , '' );

            // now to see if we add options in the link to fetch log scale

            // Add the formatted URL to the objects array
            objects.push(`${board}/${type}${brdIndex}_${channelFormatted}/root.json`);
        }
        return objects.join('\n');
    }

    let multipleFetchLink = generateObjects( what );
    console . log( 'the multiple fetch Link: ' , multipleFetchLink );
    multipleFetchLink += '\n';

    let whereToFetch = serverLink + '/' + `multi.json?number=${Rows*Cols}`

    let VECTOR_WITH_HISTO_OBJECTS = null;

    useEffect( ()=>{
        let intervalId;

        async function fetchHistograms() {
            try {
                let getTheHistos = async () => {
                    console.log("Fetching histograms from:", whereToFetch);
                    
                    // Await the result from httpRequest
                    let result = await httpRequest(whereToFetch, 'multi', multipleFetchLink);
                    
                    console.log("Histograms fetched successfully:", result);
                    return result;
                };

                VECTOR_WITH_HISTO_OBJECTS = await getTheHistos();
                console.log("Final vector of histogram objects:", VECTOR_WITH_HISTO_OBJECTS);

            } catch (err) {
                console.error("Error fetching histograms:", err);
                throw new Error(err);
            }

            for (let index = 0; index < Rows * Cols; index++) {
                let divToDrawIn = document.getElementById(`div${index + 1}`);
                if (divToDrawIn) {
                    let drawOption = null;
                    let histo = VECTOR_WITH_HISTO_OBJECTS[index];

                    // Set fill color based on conditions
                    switch (true) {
                        case qFillColor === 'red' && qFillState:
                            histo.fFillColor = '46';
                            break;
                        case qFillColor === 'slate' && qFillState:
                            histo.fFillColor = '34';
                            break;
                        case qFillColor === 'blue' && qFillState:
                            histo.fFillColor = '9';
                            break;
                        default:
                            break;
                    }

                    // Set line color based on conditions
                    switch (true) {
                        case qLineColor === 'red':
                            histo.fLineColor = '46';
                            break;
                        case qLineColor === 'slate':
                            histo.fLineColor = '34';
                            break;
                        case qLineColor === 'blue':
                            histo.fLineColor = '9';
                            break;
                        default:
                            histo.fLineColor = '12';
                    }

                    // Set draw options based on conditions
                    switch (true) {
                        case qCurvy:
                            drawOption = 'PLC';
                            break;
                        case qPoly:
                            drawOption = 'HIST';
                            break;
                        case qScatter:
                            drawOption = '*';
                            break;
                        default:
                            drawOption = 'HIST';
                            break;
                    }
                    if( hScale === 'log' ){
                        drawOption += ' LOGY';
                        console .log( 'the log draw option is: ' , drawOption );
                    }else{
                        console . log( 'the linear draw option is: ' , drawOption );
                    }
                    histo.fLineWidth = qLineWidth;
                    draw(divToDrawIn, VECTOR_WITH_HISTO_OBJECTS[index], drawOption);
                }
            }
        }

        // Initial fetch
        fetchHistograms();

        // Set up interval for repeated fetching and redrawing
        const totalInterval = (hours * 3600 + minutes * 60 + seconds) * 1000;
        intervalId = setInterval(fetchHistograms, totalInterval);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    } , [ serverLink , hours , layout , channels , minutes , seconds , board ] )
    

    console . log( layout , hScale , board , whereToFetch , multipleFetchLink , channels , hours , what , minutes , seconds , Rows , Cols , inferiorCh , superiorCh );
    

    return(
        <div className="dashboard_page" style={{ display: 'grid' , background: `url(${bg})` , 
        gridTemplateColumns: `repeat(${Cols}, minmax(550px, 1fr))` , gridTemplateRows: `repeat(${Rows}, minmax(350px, 1fr))` }}>
            {Array.from({ length: Rows }).map((_, rowIndex) =>
                Array.from({ length: Cols }).map((_, colIndex) => {
                    divNum += 1;
                    return(<div id = {`div${divNum}`}
                        key={`r${rowIndex}-c${colIndex}`}
                        style={{
                            border: '1px solid #ccc', // Optional: to visualize the grid
                        }}
                    >
                    {/* Content for each cell */}
                    </div>);
                })
            )}
        </div>
    );
} 


/*
what === '' ? what = 'hist' : what = what;

    const { board } = useParams();
    const location = useLocation();
    const query = new URLSearchParams( location . search );
    const urlChannels = query.get("channels");
    const urlLayout = query.get("layout");
    const urlHours = query.get("pHours");
    const urlMinutes = query.get("pMinutes");
    const urlSeconds = query.get("pSeconds");

    console.log("Board:", board);
    console.log("Channels:", urlChannels);
    console.log("Layout:", urlLayout);
    console.log("pHours:", urlHours);
    console.log("pMinutes:", urlMinutes);
    console.log("pSeconds:", urlSeconds);
    console . log( "Rows: " , rows );
    console . log( "Cols: " , cols );

    let divNum = 0;
    const fileExtension = '/root.json';
    const fetchInterval = ( urlHours * 3600 + urlMinutes*60 + urlSeconds) * 1000; // Interval time in milliseconds (e.g., 60000 ms = 1 minute)

    // clean the link
    serverLink = serverLink.includes('h.json')
    ? serverLink.replace('h.json', '')
        : serverLink;

    let boardID = board;

    boardID = boardID . includes('oa') ? boardID . replace('oa','') : boardID;
    console . log( 'board id in cast: ' , boardID )

    function generateLinks(boardID, channelParam, type) {
        // Extracting the board number from boardID (e.g., "Brd00" -> "00")
        const boardNumber = boardID.slice(3); // "00" from "Brd00"
    
        // Extracting the range from channelParam (e.g., "ch0-ch15" -> [0, 15])
        const [startChannel, endChannel] = channelParam
            .split('-')
            .map(channel => Number(channel.replace('ch', ''))); // Replace 'ch' and convert to numbers
        console.log(startChannel, endChannel);
        
        const links = [];
    
        console . log( startChannel , endChannel );

        // Generate links
        type === 'adc' ? type = 'ADC' : type = 'hist';
        for (let i = startChannel; i <= endChannel; i++) {
            const paddedChannel = String(i).padStart(2, '0');
            const link = `Brd${boardNumber}/${type}${boardNumber}_${paddedChannel}/root.json`;
            links.push(link);
        }
    
        console . log( "The Link: " , links );
        return links.join('\n'); // Join with newline characters
    }



    let multipleFetchLink = null;
    multipleFetchLink = generateLinks( boardID , urlChannels , what );

    multipleFetchLink += '\n';
    console . log( "Multiple fetch Link: ", multipleFetchLink );


    async function fetchHistograms() {
        let fetchedHistos = null;
        try {
            console . log( serverLink + `multi.json?number=${rows*cols}` , '\n' );
            fetchedHistos = await httpRequest(serverLink + `multi.json?number=${rows*cols}`, 'multi', multipleFetchLink);
            console.log('Fetched Histograms:', fetchedHistos);
        } catch (error) { 
            throw new error;
        }
        return fetchedHistos;
    }

    useEffect(() => {
        const processedServerLink = serverLink.includes('h.json')
            ? serverLink.replace('h.json', '')
            : serverLink;

        // clean boardi
        let drawOption = null;
        // Function to fetch data and redraw charts
        const fetchDataAndDraw = async () => {
            try {
                console.log('Fetching data from:', processedServerLink);
                console . log( 'The Histograms for this page: ' , pageArray );
                // constructing the one time fetch link
                //const oneTimeFetchLink = pageArray . map( item => ( prcessedServerLink + item + fileExtension  ) . toString() . join('\n') );
               // console . log( 'The one time fetching link: ',  oneTimeoFetchLink );
                let collectedHistos = await fetchHistograms();
                for (let index = 0; index < pageArray.length; index++) {
                    let collectedJSON = collectedHistos[ index ];
                    const divChartById = document.getElementById(`div${index+1}`);
                    if (divChartById && collectedJSON) {
                        switch( true ){
                            case qPoly:
                                drawOption = 'HIST';
                                break;
                            case qCurvy:
                                drawOption = "C";
                                break;
                            case qScatter:
                                drawOption = 'P';
                                break;
                            default:
                                drawOption = 'HIST';
                                break;
                        }
                        if( qFillState ){
                        switch( true ){
                            case qFillColor === 'red':
                                collectedJSON . fFillColor = '46';
                                break;
                            case qFillColor === 'blue':
                                collectedJSON . fFillColor = '9';
                                break;
                            case qFillColor === 'slate':
                                collectedJSON . fFillColor = '35';
                                break;
                            default:
                                collectedJSON . fFillColor = '12';
                                break; 
                        }}
                        switch( true ){
                            case qLineColor === 'red':
                                collectedJSON . fLineColor = '46';
                                break;
                            case qLineColor === 'blue':
                                collectedJSON . fLineColor = '9';
                                break;
                            case qLineColor === 'slate':
                                collectedJSON . fLineColor = '35';
                                break;
                            default:
                                collectedJSON . fLineColor = '12';
                                break;
                        }
                        collectedJSON . fLineWidth = qLineWidth;

                        redraw(divChartById, collectedJSON, drawOption );
                    }
                }
            } catch (error) {
                console.error('Failed to fetch or draw data', error);
            }
        };

        // Initial data fetch
        fetchDataAndDraw();

        // Set interval to fetch and redraw data periodically
        const intervalId = setInterval(fetchDataAndDraw, fetchInterval);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);

     }, [ rows , cols , urlHours , urlMinutes , urlSeconds , serverLink , pageArray ] ); // Dependencies that trigger the effect
     */