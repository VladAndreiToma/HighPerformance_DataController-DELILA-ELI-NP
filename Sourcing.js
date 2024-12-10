import React from "react";
import { useState , useRef , useEffect } from "react";
import gsap from "gsap";
import menuBG from "./menuBG.jpg"
import { IoReloadCircle } from "react-icons/io5";
import { AiOutlineRead } from "react-icons/ai";

function Sourcing(){

    let [ grafanaState , setGrafanaState ] = useState('');
    let [ influxState , setInfluxState ] = useState('');
    let [ status , setStatus ] = useState( '' );
    let [ grafanaEntity , setGrafanaEntity ] = useState( '' );
    let [ influxEntity , setInfluxEntity ] = useState( '' );

    
    const refToGrafanaBio = useRef( null );
    const refToInfluxBio = useRef( null );
    const refToStatus = useRef( null );

    function refreshDockerComm(){
        setStatus('');
        setGrafanaEntity('');
        setInfluxEntity('');
    }

    const executeStatusOfDocker = async(e) =>{
        e . preventDefault();
        try{
            const dokcerPSresponse = await fetch( 'http://localhost:5003/api/dockerStatus' , {
                method: 'POST' ,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if( !dokcerPSresponse ){
                throw new Error( 'Network didnt respond' );
            }
            const dataExtractedFromDockerPS = await dokcerPSresponse . json();
            console . log( 'Docker ps: ' , dataExtractedFromDockerPS );
            let portGrafana = dataExtractedFromDockerPS . length >= 2 ? dataExtractedFromDockerPS[0]["PORTS"] : null;
            let portInflux = dataExtractedFromDockerPS . length >= 2 ? dataExtractedFromDockerPS[1]["PORTS"] : null;
            console . log( 'port grafana / influx ' , portGrafana , portInflux );
            if( portGrafana && portInflux ){
                //refToStatus . current . value = 'docker status check executed - SUCCESS - grafana: hosted, influxdb hosted';
                console . log( 'status ok' );
                setStatus( 'docker ps executed - SUCCESS. grafana/influx hosted' );
                setGrafanaEntity( portGrafana + ' container:' + dataExtractedFromDockerPS[0]["CONTAINER ID"] );
                setInfluxEntity( portInflux + ' container:' + dataExtractedFromDockerPS[1]["CONTAINER ID"] );
            }
            else if( portGrafana && !portInflux ){
                refToStatus . current . value = 'docker status check executed - FAILED - influxDB container missing - (unmount->mount)';
            }
            else if( !portGrafana && portInflux ){
                refToStatus . current . value = 'docker status check executed - FAILED - grafana container missing - (unmount->mount)';
            }
        }
        catch(error){
            console . error( 'Error fetching docker: ' , error );
        }
    }

    const executeDockerMounting = async(e) => {
        e . preventDefault();
        try{

            // Step 1: Check if Docker containers are already running
            const runningContainer = await fetch('http://localhost:5003/api/dockerStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!runningContainer.ok) {
                throw new Error(`Failed to check Docker status: ${runningContainer.statusText}`);
            }

            const runningContainersData = await runningContainer.json();
            
            // Check if there are 2 or more running containers (assuming Grafana and InfluxDB)
            if (runningContainersData.length >= 2) {
                setStatus('Docker already mounted and running');
                return;
            }

            const dockerMountResponse = await fetch( 'http://localhost:5003/api/mount',{
                method: 'POST' ,
                headers: {
                    'Content-Type': 'application/json'
                }
            } );
            if( !dockerMountResponse ){
                throw new Error( 'Network dindnt respond' );
            }
            const mountingData = await dockerMountResponse . text();
            console . log( 'docker mount data: ' , mountingData );
            refreshDockerComm();
            setStatus( 'docker container mounted. See its status with the CHECK feature' );
            setGrafanaEntity( 'grafana container running' );
            setInfluxEntity( 'influx container running' );
        }
        catch(error){
            console . error( 'Error fetching docker mount: ' , error );
        }
    }


    const executeDockerUnmounting = async( e ) => {
        e . preventDefault();
        try{
            // unmount directly cause it shouldnt be an error code if everything is ok
            const dockerUnmountResponse = await fetch( 'http://localhost:5003/api/unmount' , {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                }
            } );
            if( ! dockerUnmountResponse . ok ){
                throw new Error( 'Network didnt respond' );
            }
            const dataAtUnmout = await dockerUnmountResponse . text();
            refreshDockerComm();
            setStatus( 'docker file is unmounted. Mount again to source: grafana and db' );
            setGrafanaEntity( 'grafana container removed' );
            setInfluxEntity( 'influxdb container removed' );
        }  
        catch( error ){
            console . error( 'Error fetching docker unmount: ' , error );
        }
    }

    return(
        <div id="sourcing_div" className="menu_divs" style={{ background: `url(${menuBG})` }}>
            <div id = "sourcing_content" className="content4Feature">
                From here you have easy access in sourcing your containers.
                To be sourced: a database for data storage from the electronic modules( CAEN SY 4527 HV module and MESYTEC Voltage Bias )
                and a grafana server for monitoring the parameters of interest.
                They are mounted(iso files) and orchestrated by a parent docker composer.
                You can "mount"/"unmount"/"check status" for the composer here:
                <div style={{ display: "flex" , flexDirection: "row" , justifyContent: "left" , marginTop: '20px' , gap: "50px" }}>
                    <button id="mount_composer" className="composerButton"
                        onClick={ executeDockerMounting }>Mount</button>
                    <button id="unmount_composer" className="composerButton"
                        onClick={ executeDockerUnmounting }>Unmount</button> 
                    <button id="check_composer" className="composerButton" 
                        onClick={ executeStatusOfDocker } >Check</button>
                    <button style={{ color: "white" , backgroundColor: '#333' , fontSize: '30px' , 
                        borderRadius: '45%' , height: '36px' , textAlign: 'center' }} onClick={ refreshDockerComm }><IoReloadCircle/></button>
                </div>
                <div style={{ marginTop: "20px", display: "flex" , flexDirection: "column", gap:"10px"}}>
                    <input type="text" placeholder="your composer status here(sources grafana and database)"
                        className="status_composer" ref={ refToStatus } readOnly={true} value={ status }></input>
                    <input type="text" placeholder="grafana..." className="sub_status_composer"
                     value={ grafanaEntity } ref = { refToGrafanaBio } readOnly={true}></input>
                    <input type="text" placeholder="database..." className="sub_status_composer"
                     value={ influxEntity }  ref = { refToInfluxBio } readOnly={true}></input>
                </div>
            </div>
        </div>
    )
}

export default Sourcing;