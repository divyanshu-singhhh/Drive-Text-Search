const { Client } = require('@elastic/elasticsearch');
const { google } = require('googleapis');
const { getTxtContent } = require('./googleDriveService');
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200', 
  auth: {
      username: process.env.ELASTICSEARCH_USERNAME || '', 
      password: process.env.ELASTICSEARCH_PASSWORD || '', 
      apiKey: process.env.ELASTICSEARCH_API_KEY || ''
  },
});

const syncFilesWithElasticsearch = async (index, files, oauth2Client) => {
  const indexedFiles = await getIndexedFiles(index); // Get files already indexed
  const indexedFileMap = new Map();

  // Map existing indexed files by their fileId for easy comparison
  indexedFiles.forEach(file => {
    indexedFileMap.set(file.fileId, file);
  });

  // Process each file from Google Drive
  for (const file of files) {
    const fileId = file.id;
    const fileName = file.name;
    const link = file.webViewLink;

    const content = await getTxtContent(oauth2Client, fileId); // Fetch file content

    if (indexedFileMap.has(fileId)) {
      // If the file exists, update it
      await updateFileInIndex(index,fileName,link, content, indexedFileMap.get(fileId));
      indexedFileMap.delete(fileId);  // Remove from map to avoid deletion later
    } else {
      // If the file doesn't exist, index it as new
      await indexNewFile(index,fileId, link, fileName, content);
    }
  }

  // Delete files that are no longer present in Google Drive
  for (let [fileId, file] of indexedFileMap) {
    await deleteFileFromIndex(index, fileId); // Remove the file from Elasticsearch
  }
}

// Fetch indexed files from Elasticsearch
const getIndexedFiles = async (index) => {
  // Ensure the index exists before querying
  await ensureIndexExists(index);
  const response  = await client.search({
    index: index,
    body: {
      query: {
        match_all: {}  // Fetch all documents in the index
      }
    }
  });

  // Check if body.hits exists and contains hits
  if (response && response.hits && response.hits.hits) {
    return response.hits.hits.map(hit => {
      return {...hit._source, _id: hit._id}
    });  // Return the indexed files
  } else {
    return [];  // Return empty array if no hits found
  } 
};

// Check if the index exists, if not, create it
const ensureIndexExists = async (index) => {
  const indexExists = await client.indices.exists({ index });
  if (!indexExists) {
    await client.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            fileId: { type: 'keyword' },
            file_name: { type: 'text' },
            content: { type: 'text' }
          }
        }
      }
    });
  }
};

// Update an existing file in Elasticsearch
const updateFileInIndex = async (index,fileName, link, content, existingFile) => {
  // Compare and update if content or metadata changes
  if (existingFile.content !== content || existingFile.fileName !== fileName || existingFile.link !== link) {
    await client.update({
      index,  
      id: existingFile._id,  
      body: {
        doc: {
          fileName,
          content,
          link
        }
      }
    });
  }
};

// Index a new file into Elasticsearch
const indexNewFile = async (index, fileId, link, fileName, content) => {
  await client.index({
    index,  
    document: {
      fileId,
      fileName,
      content,
      link
    }
  });
};

// Delete a file from Elasticsearch by fileId
const deleteFileFromIndex = async (index, fileId) => {
  await client.delete({
    index: index,
    id: fileId,  // Unique fileId
  });
};


async function searchDocuments(index, query) {
  const esResponse = await client.search({
    index,
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ['content'], 
          fuzziness: 'AUTO',
          prefix_length: 1,
        },
      },
    },
  });
  
  if (esResponse && esResponse.hits && esResponse.hits.hits) {
    const results = esResponse.hits.hits.map(hit => ({
      filename: hit._source.fileName,
      url: hit._source.link,   
    }));
    return results
  } else {
    return [];  
  } 
}

module.exports = { syncFilesWithElasticsearch, searchDocuments}; 