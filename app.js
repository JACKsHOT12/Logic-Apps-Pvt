const express = require('express');
const path = require('path');
const multer = require('multer');
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

// Azure Blob Storage configuration
const account = 'jackstorebro';
const accountKey = 'J6+TpDzmJKJNBOnmZmpweicAa3XXczHGtoTrosKYw5laG3fNI8/aXQAlXHY87OesyOCX5pA1NO3O+AStK/xxTg==';
const containerName = 'jackapps';
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, sharedKeyCredential);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Express app setup
const app = express();

// Serve static files (HTML, CSS, etc.)
app.use(express.static('public'));

// Route for serving the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for handling file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const blobName = file.originalname;
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const data = file.buffer;
    await blobClient.upload(data, data.length);
    res.send('File uploaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while uploading the file.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
