import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import menuBG from "./menuBG.jpg";
import { flushSync } from "react-dom";

function Visuals( {fPolyLine , fScatterLine , fCurvyLine 
    , setScale ,  fSetTheRows , fSetTheCols , fFillState , fFillColor , fLineColor , fLineWidth } ){

    const refToLayoutContent = useRef( null );
    const refToRowsInputField = useRef( null );
    const refToColsInputField = useRef( null );
    const refToKeepLayoutRB = useRef( null );
    const refToDropLayoutRB = useRef( null );
    const refToReadyInLayoutButton = useRef( null );

    function ReadyInLayout(){
        if( refToRowsInputField . current . value . trim() === '' || refToColsInputField . current . value . trim() === '' ){
          alert( 'provide input in rows/&columns input fields' );
          return;
        }
        fSetTheRows( parseInt( refToRowsInputField . current . value . trim() , 10 ) );
        fSetTheCols( parseInt( refToColsInputField . current . value . trim() , 10 ) );
      }

    let visualOptions = [ "floating" , "rescalable" , "other" ];

    return(
        <div id='visuals_div' className='menu_divs' style={ { background: `url(${menuBG})` } }>
        <div id = 'layout_content' className='content4Feature' ref={refToLayoutContent}>
            Establish the grid aspect of your monitoring page:
            <div style = {{ display: 'flex', alignItems: 'flex-start' , flexDirection: 'row' , gap: '10px', marginTop: '10px',   marginBottom: '10px'}}>
            <input id='rows_in_layout' ref={ refToRowsInputField } onChange={ 
                (e) => {
                    fSetTheRows( parseInt( e . currentTarget . value . trim() ) );
                }
             } type = 'text' className='layout_input'  placeholder='rows here'></input>
            ✖
            <input id="cols_in_input" ref={ refToColsInputField } onChange={
                (e) => {
                    fSetTheCols( parseInt( e . currentTarget . value . trim() ) );
                }
            } type = 'text' className='layout_input'  placeholder='columns here'></input>
            </div>
            Select visual features of the monitor/s:<br/>
            Plot style: <div style={{ display: 'flex' , flexDirection: 'row' , gap: '8px' , alignItems: "center" }}>
                <label>Poly<input name="linetype" type="radio" onChange={ 
                    () => { flushSync( () => 
                    { fPolyLine( state => state ? false : true ); 
                      fScatterLine( false );
                      fCurvyLine( false );  
                    } ) } }></input></label>
                <label>Curvy<input name="linetype" type='radio' onChange={ 
                    () => { flushSync( () => 
                    { fCurvyLine( state => state ? false : true );
                        fScatterLine( false );
                        fPolyLine( false );
                    }) } }></input></label>
                <label>Scatter<input name='linetype' type='radio' onChange={ 
                    () => { flushSync( () => 
                    { fScatterLine( state => state ? false : true );
                        fPolyLine( false );
                        fCurvyLine( false );

                    }) } }></input></label>
            </div>
            <div>
            <label>Line Marker Size: <input type="text" style={{ backgroundColor: '#333' , color: 'white' , textAlign: "center" , 
                    fontSize:'16px' , height:'20px' , borderRadius: '10px' , width: '180px' }}
                    placeholder="line width 1-10"      onChange={ (e)=> {
                        flushSync( () => {
                            fLineWidth( parseInt(e . currentTarget . value . trim(),10) );
                        } )
                    }  }></input>
                </label>
            </div>
            Visual Effects: <div style={{ display: 'flex' , flexDirection: 'row' , gap: '8px' }}>
                <label>Filling:<input name='fillDecision' type="radio" onChange={
                    () => {
                        flushSync(()=>{
                            fFillState( true );
                        })
                    }
                } ></input>Y <input name='fillDecision' type="radio" onChange={
                    () => {
                        flushSync( ()=>{
                            fFillState( false )
                        } )
                    }
                }></input>N</label>
                <label>/ Fill color: 'red'<input name='fillColor' type="radio"  onChange={()=>{
                    flushSync(()=>{
                        fFillColor( 'red' );
                    });
                }}></input>; 'blue'<input name="fillColor" type="radio" onChange={()=>{
                    flushSync(()=>{
                        fFillColor( 'blue' );
                    });
                }} ></input>; 'slate'<input name="fillColor" type="radio" onChange={()=>{
                    flushSync(()=>{
                        fFillColor( 'slate' );
                    })
                }}></input>;</label>
            </div>
            <div style={{ display: 'flex' , flexDirection: 'row' , gap: '8px' }}>
                <label>Line color:  'red'<input name="lineColor" type="radio" onChange={
                    ()=>{ flushSync(()=>{
                        fLineColor( 'red' );
                    }) }
                }></input>; 'blue'<input name="lineColor" type="radio" onChange={
                    () => { flushSync(()=>{
                        fLineColor( 'blue' );
                    })}
                }></input>; 'slate'<input name="lineColor" type="radio" onChange={
                    () => { flushSync(()=>{
                        fLineColor( 'slate' );
                    })}
                }></input></label>
            </div>
            Scaling: <div>
                <label>Set Axis Scale:
                    <input type="radio" name="axisScaleType" onChange={
                        () => flushSync(()=>{
                            setScale( 'linear' );     
                        })
                    }></input><label>Linear</label> /
                    <input type="radio" name="axisScaleType" onChange={
                        () => flushSync(()=>{
                            setScale( 'log' );
                        })
                    }></input><label>LogScale</label> 
                </label>
            </div>
        </div>
        </div>
    );
}

export default Visuals;






/*

            <button id="ready_in_layout" className='ready_in_layout' style={{ marginTop: '10px' }} ref = { refToReadyInLayoutButton }  onClick = { ReadyInLayout }>Ready</button>

Now you can choose to keep the foramt for future selections or refresh it automatically when configuration is plotted
            <div style={{ display:'flex', flexDirection: 'row' , alignItems: 'flex-start',  gap: '5px' }}>
            Keep the layout: 
            <input id='select_keep_layout' ref={ refToKeepLayoutRB } name='group0' className='radio_button' type='radio'></input>
            <span style={{ marginLeft: '60px' }}></span>
            Drop the layout:
            <input id='select_drop_layout' ref={ refToDropLayoutRB } name='group0' className='radio_button' type='radio'></input>
            </div>



            Also you can select visual features of the monitor/s:<br/>
            <div style={{ display: "flex", flexDirection: "row" , gap:"60px"}}>
                <div><label style={{}}>Float </label><input type="checkbox" id="floating_option" name="option" style={{height:"22px", width:"22px" , outline: "2px" , verticalAlign:"middle" }}></input></div>
                <div><label style={{}}>Rescale </label><input type="checkbox" id="rescale_option" name="rescale" style={{height:"22px", width:"22px" , outline: "2px" , verticalAlign:"middle" }}></input></div>
            </div>
            Decide upon the data you want to see:<br/>
            <div style={ { display: "flex" , flexDirection: "row" , gap: "60px" } }>
                <div><label>ADC signal </label><input type="radio" name="data_type" id="adc" style={{ width: "22px" , height: "22px" ,verticalAlign: "middle" }}></input></div>
                <div><label>Counts </label><input type="radio" name="data_type" id="counts" style={{ width: "22px" , height: "22px" , verticalAlign: "middle" }}></input></div>
                <div><label>Energy </label><input type="radio" name="data_type" id="energy" style={{ width: "22px" , height: "22px", verticalAlign: "middle" }}></input></div>
            </div>
            */