const { BlobServiceClient } = require('@azure/storage-blob')

module.exports = ({
    azureStorageConnectionString,
    containerName,
    blobCode,
    sucess = (result, ctx) => ({ result, ctx }),
    fail = (err, ctx) => { throw err }
}) => async ctx => {
    try {
        if (azureStorageConnectionString(ctx) === undefined || azureStorageConnectionString(ctx) === '' || typeof(azureStorageConnectionString(ctx)) != 'string') throw new Error('Invalid azureStorageConnectionString');
        if (containerName(ctx) === undefined || containerName(ctx) === '' || typeof(containerName(ctx)) != 'string') throw new Error('Invalid containerName');
        if (blobCode(ctx) === undefined || blobCode(ctx) === '' || typeof(blobCode(ctx)) != 'string') throw new Error('Invalid blobCode');
        
        // Criando um objeto client de serviço de blob que vai ser usado pra criar um client do container de blobs
        const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString(ctx));

        // Criando uma referência ao container
        const containerClient = blobServiceClient.getContainerClient(containerName(ctx));

        // Criando um client pro bloco do blob
        const blockBlobClient = containerClient.getBlockBlobClient(blobCode(ctx));

        await blockBlobClient.delete();

        return await sucess(_, ctx);
    } catch (err) {
        return await fail(err, ctx);
    }
}