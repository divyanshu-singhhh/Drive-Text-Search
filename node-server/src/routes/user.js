const express = require('express');
const { getUserInfo } = require('../services/googleDriveService');
const checkAuthentication = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', checkAuthentication, async (req, res) => {
  try{
    const oauth2Client = req.oauth2Client;
    const userInfo = await getUserInfo(oauth2Client);
    res.json(userInfo); 
  }catch(e){
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

module.exports = router; 