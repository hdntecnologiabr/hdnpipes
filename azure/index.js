const uploadFileToBlobStorageContainer = require('./upload-file-to-blob-storage-container');
const deleteFileFromBlobStorageContainer = require('./delete-file-from-blob-storage-container');
const deleteFileFromBlobStorageContainerByBlobPath = require('./delete-file-from-blob-storage-container-by-blob-path');

module.exports = {
    deleteFileFromBlobStorageContainer,
    uploadFileToBlobStorageContainer,
    deleteFileFromBlobStorageContainerByBlobPath
}