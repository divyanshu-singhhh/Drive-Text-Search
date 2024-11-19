const { createOAuthClient } = require("../helpers/googleClientSetup");

let checkAuthentication = async (req, res, next) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }else{
    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(req.session.tokens);
    await oauth2Client.getAccessToken();
    req.oauth2Client = oauth2Client;
  }
  next();
}

module.exports = checkAuthentication; 