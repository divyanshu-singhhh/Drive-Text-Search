const express = require('express');
const { searchDocuments } = require('../services/elasticsearchService');
const checkAuthentication = require('../middleware/authMiddleware');
const { getUserInfo } = require('../services/googleDriveService');
const router = express.Router();
 
router.get('/', checkAuthentication, async (req, res) => {
    try {
        const { search } = req.query; 
        if (!search) {
          return res.status(400).json({ error: 'Search query parameter is required' });
        }
        const oauth2Client = req.oauth2Client;
        const userInfo = await getUserInfo(oauth2Client);
        const results = await searchDocuments(userInfo.email, search);
        res.json(results); 
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while searching documents.' });
    }
});

module.exports = router; 