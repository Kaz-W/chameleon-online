import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import './Join.css';
import io from 'socket.io-client';

export default function SignIn() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [canJoin, setCanJoin] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [uniqueName, setUniqueName] = useState(false);
  // socket used to check if room is valid or not.
  let valid_room_socket = io('https://chameleon.0x00000010.com')

  function doesRoomExist() {
    valid_room_socket.emit('isRoomJoinable', room.toLowerCase().trim(), function (responseData) {
      console.log('room is valid: ', responseData);
      setCanJoin(responseData);
    })
    }

  function isNameUnique() {
    valid_room_socket.emit('createUniqueName', {room: room.toLowerCase().trim(), name: name}, function (responseData) {
      console.log(responseData);
        setName(responseData);
        setUniqueName(true);
    })
  }

  //when a flag is switched, redirect to new room.
  useEffect(()=>{
    if (buttonClicked && canJoin && uniqueName){
      window.location.replace(`/chat?newRoom=false&name=${name}&room=${room.toLowerCase()}`)
    }
  }, [buttonClicked, canJoin, uniqueName])

  return (
    <div className="joinOuterContainer">
      <div className= "joinMediumContainer">
      <div className="joinInnerContainer pr-10">
        <h1 className="heading">Join Existing Room</h1>
        <div>
          <input placeholder="Your Name" className="joinInput" type="text" onChange={(event) => setName(event.target.value.trim())} />
        </div>
        <div>
          <input placeholder="Room Code" className="joinInput mt-20" type="text"
                 onChange={(event) => {
                   setRoom(event.target.value);
                 }
                 } />
        </div>
        <span onClick={
          () => {
            setButtonClicked(true);
            isNameUnique();
            doesRoomExist();
          }
        }>
          <button className={'button mt-20'} type="submit">Join</button>
        </span>
      </div>
      <div className="joinInnerContainer">
        <h1 className="heading newRoom">Create New Room</h1>
        <div>
          <input placeholder="Your Name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} />
        </div>
        <Link onClick={e => (!name) ? e.preventDefault() : null} to={`/chat?newRoom=true&name=${name}&room=null`}>
          <button className={'button mt-20'} type="submit">Create</button>
        </Link>
      </div>
      </div>
    </div>

  );
}
