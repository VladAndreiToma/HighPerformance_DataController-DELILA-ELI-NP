import React from "react";
import { useState , useEffect , useRef } from "react";
import { gsap } from "gsap/gsap-core";
import menuBG from "./menuBG.jpg"
import { BrowserRouter as Router , Routes , Route, Link } from "react-router-dom";
import GrafanaCAEN from "./GrafanaCAEN";
import GrafanaMSYTEC from "./GrafanaMSYTEC";

export default function Grafana_Main(){
    return(
        <div className="menu_divs" style={{ background: `url(${menuBG})` }}>
            <div className="content4Feature"
                style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <label>From here you can select what GRAFANA's you want to access:</label>
            <Link to="/grafana/caen_sy_4527_hv_module"
                style={{ border: "solid #333", borderRadius: "10px", padding: "5px 60px" }}
                className="standard_link_pages">
                Grafana for CAEN SY4527 High Voltage Module
            </Link>
            <Link to='/grafana/msytec'
                style={{ border: 'solid #333' , borderRadius: '10px' , padding: '5px 60px' }}
                className="standard_link_pages">
                    Grafana for MSYTEC Voltage Bias Module
            </Link>
            </div>
            {/* Define child routes here */}
            <Routes>
                <Route path="caen_sy_4527_hv_module" element={<GrafanaCAEN />} />
                <Route path="msytec" element={ <GrafanaMSYTEC /> }/>
            </Routes>
        </div>
    )
}