import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import menuBG from "./menuBG.jpg"
import { FaEye } from "react-icons/fa";

function GrafanaCAEN(){
    return(
        <div id="grafana_div" className="menu_divs" style={{ background: `url(${menuBG})` }}>
            <div id = "grafana_content" className="content4Feature">
                From here you can inspect status of electronic modules of the experiment.
                Available features: Voltages , Currents , Temperatures.<br/><br/>
                <div style={{ display: "flex" , gap:'10px' ,  flexDirection: 'column' }}>
                    
                    <a style={{ border: "solid 3px #333", padding: '3px 10px' ,  borderRadius: '10px' , textDecoration: 'none' , color: 'white' , fontFamily: 'monospace' , fontSize: '18px' }}  
                    href="http://localhost:3005/d/A5DC01qSz/voltages-vmon-for-all-boards?orgId=1"
                    target="_blank" rel="noopener noreffere"><FaEye /> HV_module voltages here</a>

                    <a style={{ border: 'solid 3px #333' , padding: '3px 10px' , borderRadius: '10px' , textDecoration: 'none' , color: 'white' , fontFamily: 'monospace' , fontSize: '18px' }} 
                    href="http://localhost:3005/d/IdP9aJ3Ik/currents-imon-for-hv-module?orgId=1"
                    target="_blank" rel="noopener noreffer"><FaEye /> HV_module currents here...</a>

                    <a style={{ border: 'solid 3px #333' , padding: '3px 10px' , borderRadius:'10px' , textDecoration: 'none' , color: 'white' , fontFamily: 'monospace' , fontSize: '18px'  }}
                    href="http://localhost:3005/d/gxfdYJqIk/temperatures-for-hv-module?orgId=1&from=now-15m&to=now"
                    target="_blank" rel="noopener noreffer"><FaEye /> HV_module temperatures here...</a>
                </div>
            </div>
        </div>
    )
}

export default GrafanaCAEN;