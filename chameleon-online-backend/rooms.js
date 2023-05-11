//rooms are the objects in which games take place.

//room consists of:
// - list of players in the room.
// - list of words being used in the game.
// - list of chameleons.

const {getUser, getUsersInRoom} = require('./users')

const sample = require('lodash.sample');

//console.log(getUser);
//console.log(getAllUsers('AAAAA'));
let rooms = [['aaaa', 'none', true]];


function makeRoomId(length) {
    let result           = '';
    let characters       = 'bcdfghjklmnpqrstvwxyz';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// creates new room for game to take place in. Takes as arg the socket ID for the user which will be the group's initial admin.
const createRoom = () => {
    let id = makeRoomId(4);

    // check room with same ID doesnt already exist. If it does exist, generate new ID until successful one found.
    // chance of generating clashing rooms very very low but theoretically possible.
    while (rooms.indexOf(id) !== -1){
        console.log('Room already found while generating, regenerating room ID');
        id = makeRoomId(4);
    }
    //log room creation to console.
    console.log('Created new room: ', id);
    rooms.push([id, 'none', true]);

    return id;
}

//TODO: this should throw error if can't find room index?
const addAdmin = (roomID, adminId) => {
    if (getRoomIndex(roomID) === -1){
        return {error: 'Failed to connect to room, room does not exist. Error code: E3.'}
    }
    // otherwise, room does exist, so we can go ahead and update it.
    rooms[getRoomIndex(roomID)][1] = adminId;
    console.log('Updated admin:', rooms[getRoomIndex(roomID)][1])
    return {};
}

const removeAdmin = (roomID) => {
    if (getRoomIndex(roomID) === -1){
        return {error: 'Failed to connect to room, room does not exist. Error code: E4.'}
    }
    console.log('Removing admin:', rooms[getRoomIndex(roomID)][1]);
    rooms[getRoomIndex(roomID)][1] = '';
    return {};
}

//replaces current admin with someone else.
// Somewhat of a savior function, just helpful when faffing around with admins, can easily 'reset' the admin state of a room (kinda).
// TODO: Not much error checking here, feel like things could go wrong...
const generateNewAdmin = (roomID) => {
    console.log('Admin of room', roomID, getAdminFromRoom(roomID));
    if (getUsersInRoom(roomID).length === 0){
        rooms[getRoomIndex(roomID)][1] = '';
        console.log('cannot generate new admin for room with no users...');
        return {error : 'cannot generate new admin for room with no users...'};
    }
    const roomAdmin = getAdminFromRoom(roomID)
    if (roomAdmin.admin && roomAdmin.admin !== 'none'){
        // if room already has an admin?
        if (getUsersInRoom(roomID).length === 1){
            console.log('cannot generate new admin for room with only 1 user...');
            return {error : 'cannot generate new admin for room with only 1 user...'};
        }

        let currentAdmin = roomAdmin.admin
        let newAdmin = sample(getUsersInRoom(roomID));
        console.log('Candidates:', newAdmin.id, currentAdmin.id)
        // if same user chosen again, try again
        while (newAdmin.id === currentAdmin.id){
            newAdmin = sample(getUsersInRoom(roomID));
        }
        addAdmin(roomID, newAdmin.id)
        return getAdminFromRoom(roomID);
        // new admin now selected.

    }
    else {
        console.log('Room has no admin, new admin options:', getUsersInRoom(roomID).id)
        addAdmin(roomID, sample(getUsersInRoom(roomID)).id)
        return getAdminFromRoom(roomID);
    }
}

// returns true if room exists
function roomExists(id) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i][0] === id){
                return true;   // Found it
            }
        }
        return false;   // Not found
    }

function getAdminFromRoom(id) {
    if (getRoomIndex(id) !== -1) {
        // if room exists but no admin added yet, return nothing
        if (rooms[getRoomIndex(id)][1] === '') {
            return {admin: 'none'};
        }
        //otherwise, admin found.
        let admin = getUser(rooms[getRoomIndex(id)][1]);
        if (admin === -1) {
            return {admin: 'none'}
        }
        return {admin: admin}
    }
    // otherwise room doesn't exist at all.
    console.log('room does not exist.')
    return {error: 'Failed to connect to room, it may have been deleted. Error code: E2'};

}

//gets index of room in room array, returns -1 if room is not in array.
function getRoomIndex(id) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i][0] === id.toLowerCase()){
            return i;
        }
    }
    return -1;   // Not found
}

function destroyRoom(roomID){
    const index = getRoomIndex(roomID);
    if (index != -1) {
        rooms.splice(index, 1);
    }
}

function roomJoinable(roomID){
    const roomIndex = getRoomIndex(roomID)
    if (roomIndex === -1){
        return false;
    }
    return rooms[roomIndex][2];
}

function setRoomUnjoinable(roomID){
    const roomIndex = getRoomIndex(roomID)
    if (roomIndex === -1){
        return;
    }
    rooms[roomIndex][2] = false;
}


module.exports = { createRoom, roomExists, getAdminFromRoom, addAdmin, removeAdmin, generateNewAdmin, destroyRoom, roomJoinable, setRoomUnjoinable};