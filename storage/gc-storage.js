const { Storage: GStorage } = require('@google-cloud/storage')
const fs = require('fs')

let storageClient

/**
 * @returns {GStorage}
 */

const getStorage = () => {
  if (!storageClient) {
    storageClient = new GStorage({
      keyFilename: process.env.STORAGE_GCSTORAGE_KEYFILENAME
    })
  }
  return storageClient
}

const defaultFilePathFn = ctx => ''

const defaultSuccessFn = (result, ctx) => ({ result, ctx })

const defaultFailFn = (err, ctx) => {
  throw err
}

const defaultExpiresInTimestampFn = ctx => Date.now() + 1000 * 60 // one minute

const defaultFileNameFn = ctx => ''

const defaultFileBufferFn = ctx => undefined

const defaultStoragePathFn = ctx => undefined

const defaultPublicFileFn = ctx => false

/**
 * @param {string} GCStoragePath
 */

const separateGCStoragePath = GCStoragePath => {
  if (!GCStoragePath) return ''
  const urlObj = new URL(GCStoragePath.replace('gs://', 'http://'))
  return {
    bucket: urlObj.hostname,
    fileName: urlObj.pathname.replace('/', '')
  }
}
module.exports = { separateGCStoragePath }

module.exports.clearStorageClient = () => {
  storageClient = undefined
}

module.exports.get = ({
  filePath = defaultFilePathFn,
  success = defaultSuccessFn,
  fail = defaultFailFn,
  expiresInTimestamp = defaultExpiresInTimestampFn
}) => async ctx => {
  try {
    const storage = getStorage(ctx)

    const _filePath = await filePath(ctx)
    const { bucket, fileName } = separateGCStoragePath(_filePath)
    const _expiresInTimestamp = await expiresInTimestamp(ctx)

    const result = await storage.bucket(bucket).file(fileName).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: _expiresInTimestamp
    })

    return success(result[0], ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.uploadFile = ({
  fileName = defaultFileNameFn,
  fileBuffer = defaultFileBufferFn,
  filePath = defaultFilePathFn,
  storagePath = defaultStoragePathFn,
  publicFile = defaultPublicFileFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  try {
    const storage = getStorage(ctx)

    const _filePath = await filePath(ctx)
    const _fileName = await fileName(ctx)
    const _storagePath = await storagePath(ctx)
    const _publicFile = await publicFile(ctx)
    const _fileBuffer = _filePath
      ? await fs.readFileSync(_filePath)
      : await fileBuffer(ctx)

    const storageFileNameWithPath =
      (_storagePath ? `${_storagePath}/` : '') +
      new Date().getTime() +
      '-' +
      _fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s.]/gi, '')
        .replace(/\s/gi, '_')
        .toLowerCase()

    const blob = storage
      .bucket(process.env.GCLOUD_STORAGE_BUCKET)
      .file(storageFileNameWithPath)
    const blobStream = blob.createWriteStream({
      resumable: false,
      public: _publicFile
    })
    return await new Promise(resolve =>
      blobStream
        .on('finish', () => {
          resolve(
            success(
              `${_publicFile ? 'https://storage.googleapis.com/' : 'gs://'}${
                process.env.GCLOUD_STORAGE_BUCKET
              }/${storageFileNameWithPath}`,
              ctx
            )
          )
        })
        .end(_fileBuffer)
    )
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.removeFile = ({
  storagePath = defaultStoragePathFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  try {
    const storage = getStorage(ctx)

    const _storagePath = await storagePath(ctx)

    const { bucket, fileName } = separateGCStoragePath(_storagePath)

    await storage.bucket(bucket).file(fileName).delete()

    return success(true, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
