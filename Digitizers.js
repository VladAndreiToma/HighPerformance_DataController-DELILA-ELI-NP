import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import menuBG from "./menuBG.jpg"

function Digitizers(){
    return(
        <div id="digitizers_div" className="menu_divs" style={{ background: `url(${menuBG})` }}>
            <div id = "digitizers_content" className="content4Feature">
                From here you can inspect your digitizers for certain
                data of interest and check their statuses.
            </div>
        </div>
    )
}

export default Digitizers;