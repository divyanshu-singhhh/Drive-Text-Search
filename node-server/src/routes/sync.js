const express = require('express');
const { createOAuthClient } = require('../helpers/googleClientSetup');
const { listTxtFiles, getUserInfo } = require('../services/googleDriveService');
const checkAuthentication = require('../middleware/authMiddleware');
const { syncFilesWithElasticsearch } = require('../services/elasticsearchService');
const router = express.Router();

// Sync files from drive and elastic search
router.post('/', checkAuthentication, async (req, res) => {
  try {
    const oauth2Client = req.oauth2Client;
    const files = await listTxtFiles(oauth2Client);
    const userInfo = await getUserInfo(oauth2Client);
    await syncFilesWithElasticsearch(userInfo.email, files, oauth2Client);
    res.status(201).json({ message: 'Data synced successfully'});
  } catch (e) {
    res.status(500).json({ error: 'An error occurred while syncing files.' });
  }
});

module.exports = router; 