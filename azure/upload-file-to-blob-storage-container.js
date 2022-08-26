const { BlobServiceClient } = require('@azure/storage-blob')
const crypto = require("crypto");

module.exports = ({
  azureStorageConnectionString,
  containerName,
  binaryFile,
  sucess = (result, ctx) => ({ result, ctx }),
  fail = (err, ctx) => { throw err }
}) => async ctx => {
  try {

    if (azureStorageConnectionString(ctx) === undefined || azureStorageConnectionString(ctx) === '' || typeof (azureStorageConnectionString(ctx)) != 'string') throw new Error('Invalid azureStorageConnectionString');
    if (containerName(ctx) === undefined || containerName(ctx) === '' || typeof (containerName(ctx)) != 'string') throw new Error('Invalid containerName');

    // Criando um objeto client de serviço de blob que vai ser usado pra criar um client do container de blobs
    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString(ctx));

    // Criando uma referência ao container
    const containerClient = blobServiceClient.getContainerClient(containerName(ctx));

    const blobCode = crypto.randomInt(10000000000, 100000000000000).toString() + crypto.randomInt(10000000000, 100000000000000).toString() + crypto.randomInt(10000000000, 100000000000000).toString() + crypto.randomInt(10000000000, 100000000000000).toString();

    // Criando um client pro bloco do blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobCode);

    // Fazendo o upload do arquivo para o blob
    await blockBlobClient.upload(binaryFile(), binaryFile().length);

    return await sucess(blockBlobClient.url, ctx);
  } catch (err) {
    return await fail(err, ctx);
  }
}