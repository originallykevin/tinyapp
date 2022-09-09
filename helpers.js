/// HELPER FUNCTIONS ///

// check if email is in users{ } for 
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
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

// create random 6 letter/nmber string for an id tag
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
}
