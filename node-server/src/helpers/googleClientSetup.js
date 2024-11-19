const { google } = require('googleapis');

const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET, 
    process.env.REDIRECT_URL 
  );
};

module.exports = {
  createOAuthClient
}


