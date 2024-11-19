const { google } = require('googleapis');

async function listTxtFiles(oauth2Client) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  // Fetch the list of files
  const response = await drive.files.list({
    q: "mimeType='text/plain'", // Query for .txt files
    fields: 'files(id, name, webViewLink)', // Fields to return
  });
  return response.data.files;
}

async function getTxtContent(oauth2Client, fileId){
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
   // Download the .txt file
   const fileRes = await drive.files.get({
    fileId: fileId,
    alt: 'media',  // This tells Google to return the raw content
  });
  const content = fileRes.data; // The raw file content
  return content
}

// Fetch Google user info
const getUserInfo = async (oauth2Client) => {
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const response = await oauth2.userinfo.get();
    return response.data; 
};

module.exports = { listTxtFiles, getTxtContent, getUserInfo }; 