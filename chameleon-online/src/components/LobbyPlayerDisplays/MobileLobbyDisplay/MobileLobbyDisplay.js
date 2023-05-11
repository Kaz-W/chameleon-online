import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';

import './MobileLobbyDisplay.css';
import HighlightAdmin from "../HighlightAdmin";

const MobileLobbyDisplay = ({ users, admin, room, name}) => {
    console.log('isAdmin', admin, name)
    let mobileDisplay = "mobileDisplay";
    if (admin.name !== name){
        mobileDisplay = "mobileDisplay notAdminDisplay"
    }
    return (<div className={mobileDisplay}>
                <h1 className = "mobileRoomNumber">Room number: {room.toUpperCase()}</h1>
                <div className = "mobileLobby">
                <span className = "mobilePeopleTitle">People in lobby:</span>
                <ScrollToBottom className="mobileUsers">
                    {users ? (
                            <div className="activeContainer">
                                {users.map((user, i) => (
                                    <HighlightAdmin key = {i} user = {user} admin = {admin}/>
                                ))}
                            </div>)
                        : null
                    }

                </ScrollToBottom>
                </div>
            </div>
    )
}

export default MobileLobbyDisplay;