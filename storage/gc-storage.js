const { Storage: GStorage } = require('@google-cloud/storage')

let storageClient

/**
 * @returns {{GStorage}}
 */

const getStorage = () => {
  if (!storageClient) {
    storageClient = new GStorage()
  }
  return storageClient
}

const defaultFilePathFn = ctx => ''

const defaultSuccessFn = (result, ctx) => ({ result, ctx })

const defaultFailFn = (err, ctx) => {
  throw err
}

const defaultExpiresInTimestampFn = ctx => Date.now() + 1000 * 60 // one minute

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
