// author: Vlad Andrei Toma , engr.
// the basic backend structure
const express = require( 'express' );
const {exec} = require( 'child_process' );
const cors = require( 'cors' );
const path = require( 'path' );
const { stderr, stdout } = require('process');
const bodyParser = require( 'body-parser' );
const fs = require('fs');

// for socket communication to send the setter json - making use of net library
const net = require( "net" );


const DelilaSeverComm = express(); // instance of node server using express framework

const DScommPort = 5003; // server runs on 3003

DelilaSeverComm . use( cors() );    // make cross port comm available
DelilaSeverComm . use( express . json() );     //enable json communication
DelilaSeverComm . use( bodyParser . json() );

const dockerComposerDir = path . join( '../caen5427_interrogator/' );
console . log( 'docker path: ' , dockerComposerDir );

console . log( __dirname );

const logFilePath = path . join( __dirname , 'userslogs.txt' );   // creates a local filez

console . log( logFilePath );


// function to log the data using fs module it will write the stuff the the txt file in the append mode
function logToFile( data ){
    console . log( ' log function called ' );
    const logEntry = `at: ${new Date().toISOString()} user introcuced: ${data}\n`;
    fs.appendFile( logFilePath , logEntry , (err) => {
        if( err ){
            console. log( 'entry log writting error: ' , err );
        }
    } );
}

// make available a post method for the data sent for msytec
DelilaSeverComm . post( '/api/sendToMsyTec' , ( req , res ) => {
    const dataGained = req . body;
    console . log( 'sending data from user node server: ' , dataGained );
    logToFile( JSON . stringify( dataGained ) );
    
    // making a client instance
    const senderClient = new net . Socket();
    let stringifiedInstructionsJSON = JSON . stringify( dataGained );
    const receiverStationIp = '172.18.6.59';
    const recieverStationPort = 5010;
    senderClient . connect( recieverStationPort , receiverStationIp , () =>{
        try{
            console . log( 'Connected to reciever set script for mesytec module ' , '@ ' , receiverStationIp  );
            senderClient . write( stringifiedInstructionsJSON );
        }
        catch( error ){
            throw new error;
            // smth was wrong in using net . socket initialization
        }
    } )
} );

// handle what commes from mount button as <mount> command
DelilaSeverComm . post( '/api/mount' , ( (request , result)  => {
    exec( 'docker-compose up -d' , { cwd: dockerComposerDir } , ( error , stdout , stderr ) => {
        if ( error ){
            console . log( "problem in mounting command: " , error );
            return result . status(500) . send( `Error: ${error}` );
        }
        result . send( `Docker container started: ${stdout}` );
    } );
}) );

DelilaSeverComm . post( '/api/unmount' , ( req , res ) => {
    exec( 'docker-compose down' , {cwd: dockerComposerDir} , ( error , stdout , stderr ) => {
        if( error ){
            console . error( "problem in unmounting command: " , error );
            return res . status( 500 ) . send( `Error: ${stderr}` );
        }
        res . send( `Docker container down: ${stdout}` );
    } );
} );

DelilaSeverComm . post( '/api/dockerStatus' , ( req , res ) => {
    exec( 'docker ps' , {cwd: dockerComposerDir} , ( error , stdout , stderr ) => {
        if( error ){
            console . error( "problem in docker ps command: " , error );
            return res . status( 500 ) . send( `Error: ${stderr}` );
        }
        const lines = stdout.trim().split('\n');
        const headers = lines[0].split(/\s{2,}/); // Split by 2 or more spaces to separate headers

        const containers = lines.slice(1).map(line => {
            const values = line.split(/\s{2,}/); // Split by 2 or more spaces to separate values
            const container = {};
            headers.forEach((header, index) => {
                container[header] = values[index];
            });
            return container;
        });

        res.json(containers); // Send parsed data as JSON
    } );
} );


DelilaSeverComm . listen( DScommPort, () => {
    console . log( 'Delila server listens on port , ' , DScommPort );
}
 );