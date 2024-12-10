import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import menuBG from "./menuBG.jpg"

function ExportLogs(){
    return(
        <div id="exportLogs_div" className="menu_divs" style={{ background: `url(${menuBG})` }}>
            <div id = "exportLogs_content" className="content4Feature">
                Decide on wether you want to export and after use your data
                Time decisions , what to fetch , where to write and in what format you prefer the stuff.
            </div>
        </div>
    )
}

export default ExportLogs;