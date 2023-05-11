import React from 'react';

import './TextContainer.css';
import HighlightAdmin from "../HighlightAdmin";

const TextContainer = ({ admin, users}) => {
    console.log(admin, users);

    return (
        <div className ="textOuterContainer">
            <div className="textContainer">
                <div>
                    <h1>People in lobby:</h1>
                </div>
                {users ? (
                            <div className="activeContainer">
                                {users.map((user, i) => (
                                    <HighlightAdmin key = {i} user = {user} admin = {admin}/>
                                ))}
                            </div>)
                    : null
                }
            </div>
        </div>
    )
}
export default TextContainer;