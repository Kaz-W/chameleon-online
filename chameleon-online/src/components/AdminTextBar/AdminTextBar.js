import React from 'react';


import './AdminTextBar.css';

const AdminTextBar = ({isAdmin}) => {
    if (!isAdmin) {
        return <div className="adminTextBar"> Waiting for admin to start the game.</div>
    } else {
        return null
    }
}

export default AdminTextBar;