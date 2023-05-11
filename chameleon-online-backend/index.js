const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser,
  removeUser,
  getUser,
  getUsersInRoom } = require('./users');
const {
    createRoom,
    roomExists,
    getAdminFromRoom,
    addAdmin,
    generateNewAdmin,
    removeAdmin,
    destroyRoom,
    roomJoinable,
    setRoomUnjoinable} = require('./rooms.js')

const router = require('./router');
const MAX_ROOM_SIZE = 3;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

//from: https://stackoverflow.com/a/2450976

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


function generateChameleons(gameData, users){
    // select how many chameleons to create
    let numberOfChameleons;
    if (gameData.isChameleonNumberRandom){
        numberOfChameleons = Math.floor(Math.random() * parseInt(gameData.randChameleonNumberMax))+ parseInt(gameData.randChameleonNumberMin);
        console.log("rand number of chameleons", gameData.randChameleonNumberMax, gameData.randChameleonNumberMin, numberOfChameleons);
    } else {
        numberOfChameleons = gameData.chameleonNumber;
    }
    if (numberOfChameleons > users.length) {
        numberOfChameleons = users.length;
    }
    // generate chameleons:
    // shuffle array of users and take as many as there are chameleons.
    let chameleons = shuffle(users).slice(0, numberOfChameleons);
    console.log('users and chameleons: ', users, chameleons)
    return chameleons;
}

function generateWord(words){
    console.log(words)
    let wordIndex = Math.floor(Math.random() * words.length);
    return words[wordIndex].trim();
}

io.on('connect', (socket) => {

  socket.on('isRoomJoinable', function (queriedRoom, callback) {
    let joinable =  roomExists(queriedRoom)
    console.log('Checking if room exists', queriedRoom, roomExists(queriedRoom));
    if (joinable){
        joinable = roomJoinable(queriedRoom)
    }
    //console.log('connection data:', evData);
    callback(joinable);
  });

  socket.on('startGame', function(input) {
      // TODO: should check this doesn't throw an error if there is no admin...
      console.log('request from', socket.id, 'admin: ', getAdminFromRoom(input.room))
      let isAdmin = (socket.id === getAdminFromRoom(input.room).admin.id)
      if (isAdmin){
          setRoomUnjoinable(input.room)
          console.log('setting room', input.room, 'unjoinable');
          console.log(input.gameData);
          let user_sockets = Object.keys(io.sockets.adapter.rooms[input.room].sockets)
          let chameleons = generateChameleons(input.gameData, user_sockets)
          let wordSet = input.gameData.wordSet;
          let word;
          if (input.gameData.isWordSetCustom){
              wordSet = input.gameData.wordSet.split(',');
              word = generateWord(wordSet)
          } else {
              word = generateWord(input.gameData.wordSet);
          }
          // generate 25 words to use to display to users
          let random25Words = shuffle(wordSet);
          console.log(random25Words)
          random25Words.splice(Math.floor(Math.random() *random25Words.length), 0, 'You are a chameleon 🦎');
          while (random25Words.length < 25){
              if (random25Words.length < 12){
                  random25Words = random25Words.concat(random25Words);
              }
              else {
                  const remainingAmount = 25 - random25Words.length;
                  random25Words = random25Words.concat(random25Words.slice(0, remainingAmount))
              }
          }
          console.log(random25Words, random25Words.length);
          for (let i = 0; i < user_sockets.length; i++){
              console.log("!")
              console.log(wordSet)
              if (chameleons.includes(user_sockets[i])) {
                  console.log('chameleon: ', user_sockets[i])
                  io.to(user_sockets[i]).emit('gameStart', {randomWords: random25Words, words: wordSet, word: 'You are a chameleon 🦎', isChameleon: true});
              } else {
                  console.log('normal user: ', user_sockets[i])
                  io.to(user_sockets[i]).emit('gameStart', {randomWords: random25Words, words: wordSet, word: word, isChameleon: false});
              }
          }
      }
  })

  socket.on('createNewRoom', function (callback) {
    console.log('Socket (server-side): creating new room.');
    // should catch errors here potentially??
    let room = createRoom();
    callback(room);
  });

  socket.on('createUniqueName', function({room, name}, callback) {
      console.log('generating correct name', room, name);
        let users = getUsersInRoom(room);
        let usersWithName = users.filter(user => user.name === name);
        let suffix = 2;
        let newName = name;
        while (usersWithName.length !== 0) {
            // if there is already someone with a (2) try again.
            newName = name + ` (${suffix})`
            users = getUsersInRoom(room);
            usersWithName = users.filter(user => user.name === newName);
            suffix += 1;
        }
        console.log('name generated', newName);
        callback(newName);
    });

  socket.on('join', ({ name, room }, callback) => {
      //check if name is already taken in room.


      // once joined, waits 2 seconds to make sure the room being joined won't be deleted while joining.
      // need to reevaluate this somewhat because potentially room could be destroyed at any point during this process...
    // just go through methodically and make sure each function call doesnt break if there is no room...
      // TODO: redirect to 404 when joining a room that doesn't exist.

      //If there is no admin for the room, first user to join becomes the admin.
      //console.log('> current admin:', getAdminFromRoom(room));
      const adminCheck = getAdminFromRoom(room)
      if (adminCheck.error){
          callback(adminCheck.error);
      }

      if (adminCheck.admin === 'none'){
          console.log('No admin, adding user as admin to room: ', room)
          let addAdminCheck = addAdmin(room, socket.id)
          if (addAdminCheck.error){
              callback(addAdminCheck.error);
          }
      }

      console.log('user', socket.id, 'name', name, 'joining to room: ', room);

      const addUserAttempt = addUser({id: socket.id, name, room});

      if (addUserAttempt.error) return callback(addUserAttempt.error);

      socket.join(addUserAttempt.user.room);    // if at this point room has been deleted, user is at least in the correct 'channel'
        console.log(' > Joind room');
      socket.emit('message', {user: 'admin', text: `${addUserAttempt.user.name}, welcome to room ${addUserAttempt.user.room}.`});
      socket.broadcast.to(addUserAttempt.user.room).emit('message', {user: 'admin', text: `${addUserAttempt.user.name} has joined!`});

      const adminForRoom = getAdminFromRoom(room);

      if (adminForRoom.error){
          callback(adminForRoom.error);
      }

      io.to(addUserAttempt.user.room).emit('roomData', {
        room: room,
        users: getUsersInRoom(addUserAttempt.user.room),
        admin: adminForRoom.admin
      });

      callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  //this is called whenever any socket (not just user socket) disconnects.
  socket.on('disconnect', () => {
      //for clarity, only remove user when they exist. Makes logging things easier but doesn't break without check.
      if (getUser(socket.id) === -1) {
          // socket disconnecting isn't actually a user socket.
          return;
      }
      console.log(' > DISCONNECT: User socket disconnected.')
      let user = getUser(socket.id);
      // room they are disconnecting from has admins?
      const adminFromRoomDisconnect = getAdminFromRoom(user.room)
      if (adminFromRoomDisconnect.admin) {
          // room has admin. Are they the admin?
          if (socket.id === adminFromRoomDisconnect.admin.id) {
              //admin has left, remove both admin and user at same time
              removeAdmin(user.room);
              removeUser(socket.id);
              // if they were the only person in the room and they leave... room should be removed.
              if (getUsersInRoom(user.room).length === 0) {
                  //If user is simply refreshing page, they will be sent to 404, (only happens when they are the only one in the room
                  console.log(' > DESTROYING room: ', user.room);
                  destroyRoom(user.room);
              } else { // otherwise, set new admin.
                  // if there are other people in the room, new admin created.
                  const newAdmin = generateNewAdmin(user.room);
                  if (newAdmin.error){
                      console.log(' ERROR: failed to generate new admin successfully.', newAdmin.error);
                      return;
                  }
                  if (newAdmin.admin) {
                      // signal this as an update.
                      console.log(' > Updating admin to frontend, new admin:', newAdmin.admin)
                      io.to(user.room).emit('roomData', {admin: newAdmin.admin});
                  }
              }
          }
          removeUser(socket.id);
          io.to(user.room).emit('message', {user: 'Admin', text: `${user.name} has left.`});
          io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
      }
    });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));