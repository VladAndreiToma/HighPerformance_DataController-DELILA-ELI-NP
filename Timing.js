import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import menuBG from './menuBG.jpg';

function Timing( { fSetHours , fSetMinutes , fSetSeconds } ){

    const refToRefreshingContent = useRef( null );

    return(
        <div id='refreshing_div' className='menu_divs' style={{ background: `url(${menuBG})` }} >
                <div id='refreshing_content' className='content4Feature' ref={refToRefreshingContent}>
                    Refreshing rate can be established from here. You can decide it is either:<br/>(second/seconds), (minute/minutes) or even (hour/hours)<br/>
                    Complete the fields accordingly
                    <div style={{ marginTop: '10px', display: 'flex' , flexDirection: 'row' , alignItems: 'flex-start' , gap: '10px' }}>
                    <input id = 'hoursInput'
                      onChange={ (e) => {
                        fSetHours( parseInt( e . currentTarget . value . trim() ) )
                      }}
                    type='text' className='refreshing_input' placeholder='how many hours?' ></input>
                    :
                    <input id = 'minutesInput'
                      onChange={ (e) => {
                        fSetMinutes( parseInt( e . currentTarget . value . trim() ) )
                      } }
                    type='text' className='refreshing_input' placeholder='how many minutes?'></input>
                    :
                    <input id = 'secondsInput' 
                      onChange={ (e) => {
                        fSetSeconds( parseInt( e . currentTarget . value . trim() ) )
                      } }
                    type='text' className='refreshing_input' placeholder='how many seconds?'></input>
                    </div>
                    <div style={{ marginBottom: '10px' , marginTop: '10px' , display: 'flex' , flexDirection: 'row' , alignItems: 'flex-start' }}>
                    </div> 
                </div>
        </div>
    );
}

export default Timing;