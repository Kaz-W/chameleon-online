const users = [];

const addUser = ({ id, name, room }) => {
  console.log('creating user:', id, name, room);
  name = name.trim();
  room = room.trim().toLowerCase();

  const existingUser = users.find((user) => user.room === room && user.name === name);

  if(!name || !room) return { error: 'Username and room are required.' };
  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, name, room };

  users.push(user);

  return { user };
}

const removeUser = (id) => {
  console.log('removing user:', id);
  //remove from list of users
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id){
      return users[i];
    }
  }
  return -1;   // Not found
}

const getAllUsers = () => {return users};

//worst this can return is an empty list
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom, getAllUsers};