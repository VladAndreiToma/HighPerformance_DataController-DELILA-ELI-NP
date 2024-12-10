import React from "react";

import LeftMenu from "./LeftMenu";
import RightMenu from "./RightMenu";

import AppBg from './MainBackground2.jpg';
import atom from "./atomBrief.png"

import { useState , useRef , useEffect } from "react";
import gsap from "gsap";

function MainLayout() {

  const referenceToAtomicSymbol = useRef( null );
  // top level usage of effect to animate the nucleus picture
  useEffect(() => {
      const symbolElement = referenceToAtomicSymbol.current;
      gsap.fromTo(
          symbolElement,
          {
              scale: 1,
              ease: 'power1.inOut'
          },
          {
              scale: 1.2,
              repeat: -1,
              yoyo: true,
              duration: 3,
              ease: 'back.inOut'
          }
      );

  }, []);  // activate this effect at first rendering the page title

  return (
    <div style={{ background: `url(${AppBg})` }} className="Main_Layout">
        <div id = "overlay" className="overlay">
            <LeftMenu />
            <div className="app_title">
                <label className="word_title">DELILA</label>
                <label className="word_title">MONITORING</label>
                <label className="word_title">SYSTEM</label>
                <img src={ atom } style={{ marginTop:'30px' , width: '300px' , height: '300px' }} ref={ referenceToAtomicSymbol }></img>
                <label className="app_description">Powerful . Precise . Interactive . Lightweight</label>
            </div>
            <RightMenu />
        </div>
    </div>
  );
}

export default MainLayout;
