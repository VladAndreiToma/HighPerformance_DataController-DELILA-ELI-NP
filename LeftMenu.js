import React from "react";
import { Link } from "react-router-dom";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import { isEditable } from "@testing-library/user-event/dist/utils";
import { FaDatabase , FaChartBar } from "react-icons/fa";
import { FaServer , FaCogs , FaTv , FaHourglass } from "react-icons/fa";

function LeftMenu(){
    
    const[ isLeftMenuExpanded , setLeftMenuExpansionState ] = useState( false )
    const ref_LMarrow = useRef( null );
    const ref_contentLM = useRef( null );
    const ref_LM = useRef( null );

    const changeExpansionState = () => {
        setLeftMenuExpansionState( currState => !currState );
    }

    useEffect( () => {
        gsap . to( ref_LM . current , {
            width: isLeftMenuExpanded ? '400px' : '150px',
            duration: 0.5,
            onComplete:()=>{
                ref_LMarrow . current . style . transform = isLeftMenuExpanded ? "rotate(180deg)" : "rotate(0deg)"; 
            }
        } )
    } , [ isLeftMenuExpanded ] )

    useEffect( () => {
        gsap . to( ref_contentLM . current , {
            width: isLeftMenuExpanded ? '300px' : '0px',
            duration: 0.6,
        } )
    } , [isLeftMenuExpanded] )

    return( 
        <div id="Left_Menu" className="Left_Menu" ref={ ref_LM }>
            <div id="content_LM" className="content_LM" ref={ ref_contentLM } >
                <label style={{ fontSize: '38px' , fontFamily: 'monospace' , fontWeight: "bold" , color: 'whitesmoke', justifyContent: "center" }}>
                    <FaChartBar/> RAW DATA</label>
                <Link to="/interogation" className="standard_link"><FaServer style={{ width: '20px' , height: '20px' }}/> Interrogation</Link>
                <Link to="/visuals" className="standard_link"><FaCogs style={{  }}/> Visuals</Link>
                <Link to="/timing" className="standard_link"><FaHourglass/> Timing</Link>
                <Link to="/monitor" className="standard_link"><FaTv/> Monitor</Link>
            </div>
            <span id="arrow_LM" className="arrow_LM" ref={ ref_LMarrow } onClick={changeExpansionState}>➤</span>
        </div>
     );
}

export default LeftMenu;