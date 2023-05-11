import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import {copyText} from '../utils/copyToClipboard';
import TextContainer from '../LobbyPlayerDisplays/DesktopContainers/TextContainer';
//for chat box
/*import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';*/
import AdminTextBar from "../AdminTextBar/AdminTextBar";
import MobileLobbyDisplay from "../LobbyPlayerDisplays/MobileLobbyDisplay/MobileLobbyDisplay";
import AdminStartButton from "../AdminSettings/AdminStartButton/AdminStartButton";

import './Chat.css';

const ENDPOINT = 'https://chameleon.0x00000010.com'

let timer = [100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1520,1670 ,1850, 2100 ,2350,2650,3050,3550,4200 ,5000, 6000];

let socket;

function loopThroughWords(words, word, setter){
    for (let i = 0; i < words.length; i++) {
        // for each iteration console.log a word
        // and make a pause after it
        (function (i) {
            setTimeout(function (){
                document.getElementById('wordDisplay').innerHTML = words[i];
                console.log(words[i]);
                console.log(i)
            },  timer[i]);
        })(i);
    }
    setTimeout(()=> {document.getElementById('wordDisplay').innerHTML = word
                            setter('lastWord')}, 7000);

}

const Chat = ({ location }) => {
    const [initialGet, setInitialGet] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState([]);
  //json  data for admin with name, room, and ID.
  const [admin, setAdmin] = useState('');


  //const [messages, setMessages] = useState([]); //for chatbox
  const [isLastWord, setIsLastWord] = useState('')
  //const [words, setWords] = useState('');
  //const [isChameleon, setIsChameleon] = useState(false);

  useEffect(() => {
    // this gets run if the url changes.

    const { newRoom, name, room } = queryString.parse(location.search);
    console.log(newRoom, name, room)
    // converts 'true' 'false' string into respective boolean
    var boolNewRoom = (newRoom === 'true');

    // general use socket connected to server backend.
    socket = io(ENDPOINT);

    // create new room and then join it
    if (boolNewRoom){
      socket.emit('createNewRoom', function (room) {

        // new room we should join.
        setRoom(room);
        setName(name);

        socket.emit('join', {name, room}, (error) => {
          if (error) {
              // display error to user and return to homepage.
            window.location.replace('/');
            alert(error);
          }
        });
        setInitialGet('success');
        console.log('initial get success')
        window.history.pushState("","",`/chat?newRoom=false&name=${name}&room=${room}`);
      })
    }

    // if a new room isn't being created, we are joining a room that already exists, so we join it.
    else {
       socket.emit('isRoomJoinable', room, function (responseData) {
          if(responseData) {
            // room exists! join room.
            setRoom(room);
            setName(name);

            socket.emit('join', {name, room}, (error) => {
              if (error) {
                window.location.replace(`/`);
                alert(error);
              }
                // only successfully joined once the join call returns a non-error value. By this stage, admin should be added, etc.
                console.log('initial get success')
                setInitialGet('success');
            });
          } else {
            window.location.replace(`/`);
          }
          })
        }
    }, [ENDPOINT, location.search]);

  useEffect(() => {
    //for chatbox
    //socket.on('message', message => {
    //  setMessages(messages => [ ...messages, message ]);
    //});
    
    socket.on("roomData", ({ users, admin }) => {
        console.log('recieved room data!');

        if (admin){
            console.log('updated admin', admin);
            setAdmin(admin);
        }
        if(users){
            console.log('updated users', users);
            setUsers(users);
        }
    });

    socket.on("gameStart", ({randomWords, words, word, isChameleon}) => {
        console.log(words);
        console.log('recieved game start info!')
        //if (words) {
        //    setWords(words);
        //}
        //if (isChameleon) {
        //    setIsChameleon(isChameleon);
        //}
        loopThroughWords(randomWords, word, setIsLastWord);
        setInitialGet('gameStart');
    })

}, []);

    if(initialGet===''){
        return (
            <div>
                <div className ="loading"> LOADING ROOM... </div>
                {/*<div className = "loadingSubtitle"> If this takes more than a few seconds, try refreshing the page...</div>*/}
            </div>

        )
    }
    else if(initialGet === 'success') {
        return (
            //return normal chat if user is not an admin, return admin chat if user is admin.
            <div className="outerContainer">

                <AdminTextBar className = "adminTextBar" isAdmin={name === admin.name}/>
                <div className = "roomNumberContainer">
                <div className="roomNumber"> Room Code: <i onClick={() => copyText(room.toUpperCase())}
                                                           className="clickable">{room.toUpperCase()}</i>   <span className = "clickToCopyText">(click to copy)</span>
                </div>
                </div>
                <div className = "innerContainer">
                    {/*<div className="container">
                    <InfoBar room={room}/>
                    <Messages messages={messages} name={name}/>
                    <Input socket={socket}/>
                </div>*/}

                <AdminStartButton className = "adminStartButton" socket = {socket} room = {room} admin = {admin} user = {name}/>

                </div>
                <TextContainer className="usersInLobby" users={users} admin={admin}/>
                <MobileLobbyDisplay className="mobileDisplay" users={users} admin = {admin} room={room}  name ={name}/>
            </div>
        );
    } else if (initialGet === 'gameStart') {
        return (
        <div>
            <div className = {`loading ${isLastWord}`} id= "wordDisplay"> </div>
        </div>
        )
    }
}

export default Chat;
