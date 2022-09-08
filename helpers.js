/// HELPER FUNCTIONS ///

// check if email is in users{ } for 
const getUserByEmail = function(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

// user can only see their database 
const urlsForUser = function(database, userID) {
  let newDatabase = {};
  for (let url in database) {
    if (database[url].userID === userID) {
      newDatabase[url] = database[url].longURL;
    }
  }
  return newDatabase;
};


module.exports = {
  getUserByEmail,
  urlsForUser,
}
