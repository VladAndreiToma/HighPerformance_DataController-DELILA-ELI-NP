import React from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useState , useRef , useEffect } from "react";
import { FaToolbox , FaDatabase , FaDocker , FaPaperclip } from "react-icons/fa6";
import { FaKeyboard, FaPaperPlane } from "react-icons/fa";

function RightMenu(){

    const[ isRightMenuExpanded , setRightMenuExpansionState ] = useState( false )
    const ref_RMarrow = useRef( null );
    const ref_contentRM = useRef( null );
    const ref_RM = useRef( null );

    const changeExpansionState = () => {
        setRightMenuExpansionState( currState => !currState );
    }

    useEffect( () => {
        gsap . to( ref_RM . current , {
            width: isRightMenuExpanded ? '400px' : '150px',
            duration: 0.5,
            onComplete:()=>{
                ref_RMarrow . current . style . transform = isRightMenuExpanded ? "rotate(0deg)" : "rotate(180deg)"; 
            }
        } )
    } , [ isRightMenuExpanded ] )

    useEffect( () => {
        gsap . to( ref_contentRM . current , {
            width: isRightMenuExpanded ? '300px' : '0px',
            duration: 0.6,
        } )
    } , [isRightMenuExpanded] )

    return(
        <div id="Right_Menu" className="Right_Menu" ref={ ref_RM }>
            <div id='content_RM' className="content_RM" ref={ ref_contentRM }>
                <label style={{  fontSize: '38px' , fontFamily: 'monospace' , fontWeight: "bold" , color: 'whitesmoke' }} ><FaToolbox/> MODULES</label>
                <Link to='/sourcing' className="standard_link"><FaDocker/> Sourcing</Link>
                <Link to="/grafana" className="standard_link"><FaDatabase/> Grafana</Link>
                <Link to='/digitizers' className="standard_link"><FaKeyboard/> Digitizers</Link>
                <Link to='/export-logs' className="standard_link"><FaPaperPlane/> Export_logs</Link>
            </div>
            <span id="arrow_RM" className="arrow_RM" ref={ ref_RMarrow } onClick={changeExpansionState}>➤</span>
        </div>
    );
}

export default RightMenu;