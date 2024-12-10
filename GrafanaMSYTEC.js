import React from "react";
import { useState , useEffect , useRef } from "react";
import gsap from "gsap";
import menuBG from "./menuBG.jpg"
import { FaEye } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import { BsQuestionDiamond , BsQuestionCircle } from "react-icons/bs";
import { Tooltip } from "react-tooltip";

export default function GrafanaMSYTEC(){

    let [ showTooltip , setShowTooltip ] = useState( false );
    let [ tooltipContent , setTooltipContent ] = useState( '' );

    let [ sra , setSra ] = useState( '' );
    let [ asc , setAsc ] = useState( '' );
    let [ onc , setOnc ] = useState( '' );
    let [ offc , setOffc ] = useState( '' );
    let [ suC , setSuC ] = useState( '' );
    let [sulC, setSulC] = useState('');
    let [silC, setSilC] = useState('');
    let [spC, setSpC] = useState('');
    let [stcC, setStcC] = useState('');
    let [stoC, setStoC] = useState('');
    let [stsC, setStsC] = useState('');

    let [ responseState , setResponseState ] = useState( '' );

    // send data to msytec via node server
   const sendToMsyTec = async(e) => {
        // format data
        e . preventDefault();
        const data_to_be_sent = {
            sra , asc , onc , offc , sulC , suC , silC , spC , stcC , stoC , stsC
        }
        try{
            const delilaServerAccessResponse = await fetch( 'http://localhost:5003/api/sendToMsyTec' , {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON . stringify( data_to_be_sent )
            } );
            const data = await delilaServerAccessResponse.text();

            setResponseState( data );

            console . log( 'Delila server says: ' , data );
        } catch( error ){
            console . error( 'Error sending data: ' , error );
        }
    }   


    useEffect( ()=>{
        console. log( sra ,  asc , onc , offc, spC);
    },[ sra , asc , onc , offc , sulC , silC , spC , stcC , stoC , stsC ] );

    return(
        <div id='grafana_msytec' className="menu_divs" style={{ background: `url(${menuBG})`}}>
            <div id='grafana_mesytec_features' className="content4Feature">
                From here you can access the status of the parameters made available by MSYTEC
                Voltage Bias Module. Also you can set parameters according to your needs.
                <div style={{ display: "flex" , gap:'10px' , marginTop: '15px' ,  flexDirection: 'column' }}>
                    
                    <div className="msytecContainer">
                        <a className="anchorInsideMsytec" target="_blank" rel="noopener noreffer" href="http://localhost:3005/d/Nvyoat6Ik/mesytec_monitor?orgId=1">
                            <FaEye /> Visualize Mesytec Set Parameters
                        </a>
                    </div>
            
                    <div className="wrapperForValueSet">
                        <label> <MdAddCircle /> Set Parameters: </label>
                        <div className="msytecContainer">
                            <input type="text" placeholder='SRA n' className="setBiasModuleParam" onChange={ (e) => setSra( e . currentTarget . value . trim() ) }></input>
                            <input type="text" placeholder="AS c n" className="setBiasModuleParam" onChange={ (e) => setAsc( e . currentTarget . value . trim() ) } ></input>
                            <BsQuestionDiamond
                                onMouseEnter={ () => {
                                    setShowTooltip( true );
                                    setTooltipContent( 'ramp speed n in [0,3] / auto shutdown, n=(1 enable,0 disable)' );
                                } } 
                                onMouseLeave={ () => { 
                                    setShowTooltip( false );
                                } }
                            style={{ fontWeight: 'bold' , fontSize: '28px' , fontFamily: 'monospace' , cursor: "pointer" }}/>
                        </div>
                        <div className="msytecContainer">
                            <input type="text" placeholder="ON c" className="setBiasModuleParam" onChange={ (e) => setOnc( e . currentTarget . value . trim() ) } ></input>
                            <input type="text" placeholder="OFF c" className="setBiasModuleParam" onChange={ (e) => setOffc( e . currentTarget . value . trim()  ) } ></input>
                            <BsQuestionDiamond 
                                onMouseEnter={ () => { 
                                    setShowTooltip( true );
                                    setTooltipContent( 'Enable channel ON/OFF' );
                                } } 
                                onMouseLeave={ () => setShowTooltip( false ) }  
                             style={{ fontWeight: 'bold' , fontSize: '28px' , fontFamily: 'monospace', cursor: 'pointer' }}/>
                        </div>
                        <div className="msytecContainer">
                            <input type='text' placeholder="SUL c vvvv(V limit)" className="setBiasModuleParam"  onChange={ (e) => setSulC( e . currentTarget . value . trim() ) }></input>
                            <input type='text' placeholder="SIL c iiii(C limit)" className="setBiasModuleParam" onChange={ (e) => setSilC( e . currentTarget . value . trim() ) }></input>
                            <BsQuestionDiamond 
                                onMouseEnter={ () => { 
                                    setShowTooltip( true );
                                    setTooltipContent( 'set voltage / current limit of channel c. vvvv/iiii in [0,4000]' );
                                } } 
                                onMouseLeave={ () => setShowTooltip( false ) }  
                             style={{ fontWeight: 'bold' , fontSize: '28px' , fontFamily: 'monospace', cursor: 'pointer' }}/>
                        </div>
                        <div className="msytecContainer">
                            <input type="text" placeholder="SP c p" className="setBiasModuleParam" onChange={ (e) => setSpC( e . currentTarget . value . trim() ) }></input>
                            <input type='text' placeholder="SU c vvvv" className="setBiasModuleParam" onChange={ (e) => setSuC( e . currentTarget . value . trim() ) }></input>
                            <BsQuestionDiamond 
                                onMouseEnter={ () => { 
                                    setShowTooltip( true );
                                    setTooltipContent( 'set polarity pos/neg, p is positive n is negative, c channel' + ';' + ' set voltage on channel c vvvv*0.1' );
                                } } 
                                onMouseLeave={ () => setShowTooltip( false ) }  
                             style={{ fontWeight: 'bold' , fontSize: '28px' , fontFamily: 'monospace', cursor: 'pointer' }}/>
                        </div>
                        <div className="msytecContainer">
                            <input type="text" placeholder="STC c n" className="setBiasModuleParam" onChange={ (e) => setStcC( e . currentTarget . value . trim() ) } ></input>
                            <input type="text" placeholder="STO c ttt" className="setBiasModuleParam" onChange={ (e) => setStoC( e . currentTarget . value . trim() ) }></input>
                            <input type="text" placeholder="STS c ssss" className="setBiasModuleParam" onChange={ (e) => setStsC( e . currentTarget . value . trim() ) }></input>
                            <BsQuestionDiamond 
                                onMouseEnter={ () => { 
                                    setShowTooltip( true );
                                    setTooltipContent( 'set temp comp. c channel, n=(0,-/4) / set temp. ref ttt=number*0.1C / set temp comp. slop for ch ssss=number*mV/C' );
                                } } 
                                onMouseLeave={ () => setShowTooltip( false ) }  
                             style={{ fontWeight: 'bold' , fontSize: '28px' , fontFamily: 'monospace', cursor: 'pointer' }}/>
                        </div>
                        <button className="sendToMsyTec" onClick={ sendToMsyTec }>Send data to msytec</button>
                        <input type="text" placeholder="mesytec response" readOnly={true}  value={ responseState }  className="mesytecResponse"></input>
                    </div>

                </div>
            </div>
            {
                                showTooltip &&(
                                    <div style={{ backgroundColor: 'crimson' , position: 'absolute' , right: '30px' , top: '30px' , zIndex: '10' , color: 'white' }}>
                                        { tooltipContent }
                                    </div>
                                )
                            }
        </div>
    )

}





/*

The container that will hold idividual monitors -> but that is overcoded

                    <div className="msytecContainer">
                        <a className="anchorInsideMsytec"   href=""
                            target="_blank" rel="noopener noreffere"><FaEye/> voltages</a>
                        <a className="anchorInsideMsytec" href=""
                            target="_blank" rel="noopener noreffer"><FaEye /> voltage presets</a>
                        <a className="anchorInsideMsytec"   href=""
                            target="_blank" rel="noopener noreffer"><FaEye /> voltage limits</a>
                    </div>

                    <div className="msytecContainer">
                        <a className="anchorInsideMsytec"
                            href=""
                            target="_blank" rel="noopener noreffer"><FaEye/> currents</a>
                            <a className="anchorInsideMsytec"
                            target="_blank" rel="noopener noreffer"><FaEye /> current limits</a>
                            <a className="anchorInsideMsytec"     href=""
                                target="_blank" rel="noopener noreffer"><FaEye /> polarities</a>
                    </div>

                    <div className="msytecContainer">
                        <a className="anchorInsideMsytec"
                            href=""
                            target="_blank" rel="noopener noreffer"><FaEye /> temp compensation settings</a>
                        <a className="anchorInsideMsytec"
                            href=""
                            target="_blank" rel="noopener noreffer"><FaEye /> temp at input</a>
                    </div>

                    <div className="msytecContainer">
                        <a className="anchorInsideMsytec"
                                href=""
                                target="_blank" rel="noopener noreffer"><FaEye /> HV ramp speed</a>
                    </div>



*/