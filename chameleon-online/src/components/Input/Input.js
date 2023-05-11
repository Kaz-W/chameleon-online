import React, {useState} from 'react';

import './Input.css';

export default function Input({socket}) {
    const [message, setMessage] = useState('');

    const sendMessage = (event) => {
        event.preventDefault();

        if(message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    return (
        <form className="form">
            <input
                className="input"
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={({target: {value}}) => setMessage(value)}
                onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
            />
            <button className="sendButton" onClick={e => sendMessage(e)}>Send</button>
        </form>
    )
}
