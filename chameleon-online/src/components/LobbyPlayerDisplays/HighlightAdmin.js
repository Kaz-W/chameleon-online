import onlineIcon from "../../icons/onlineIcon.png";
import React from "react";

const HighlightAdmin = ({user, admin}) =>{
    if (admin) {
        if (user.id === admin.id) {
            return (
                <div key={user.name} className="activeItem"> {user.name} <i className="adminText"> (Admin)</i>
                    <img alt="Online Icon" src={onlineIcon}/>
                </div>
            )
        }
        else{
            return (
                <div key={user.name} className="activeItem"> {user.name}
                    <img alt="Online Icon" src={onlineIcon}/>
                </div>
            )
        }
    }
    else{
        return (
            <div key={user.name} className="activeItem"> {user.name}
                <img alt="Online Icon" src={onlineIcon}/>
            </div>
        )
    }
}

export default HighlightAdmin;