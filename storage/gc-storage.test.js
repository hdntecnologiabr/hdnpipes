const { Storage } = require('@google-cloud/storage')
const { get, clearStorageClient, separateGCStoragePath } = require('./gc-storage')

jest.mock('@google-cloud/storage')

describe('storage module', () => {
  describe('storage cache', () => {
    it('deve executar a função storage.get do storage, gerando o storageClient e em seguida chamar a mesma funcao novamente usando o firestoreClient gerado', async () => {
      Storage.mockImplementation(() => ({
        bucket: bu => {
          expect(bu).toBe('test-bucket')
          return {
            file: fn => {
              expect(fn).toBe('test-filename')
              return {
                getSignedUrl: opts => {
                  expect(opts.expires).toBe(1000)
                  return []
                }
              }
            }
          }
        }
      }))

      await get({ filePath: () => 'gs://test-bucket/test-filename', expiresInTimestamp: () => 1000 })()
      await get({ filePath: () => 'gs://test-bucket/test-filename', expiresInTimestamp: () => 1000 })()
    })
  })

  describe('separateGCStoragePath function', () => {
    it('deve passar chamar a função separateGCStoragePath e retornar corretamente o filename e o bucket', () => {
      expect(separateGCStoragePath('gs://test-bucket/test-filename')).toEqual({
        bucket: 'test-bucket',
        fileName: 'test-filename'
      })
    })
  })

  describe('get function', () => {
    beforeEach(() => {
      Storage.mockReset()
      clearStorageClient()
    })

    it('deve passar os parametros corretos para a função storage.get', async () => {
      Storage.mockImplementation(() => ({
        bucket: bu => {
          expect(bu).toBe('bucket-test')
          return {
            file: fn => {
              expect(fn).toBe('filename-test')
              return {
                getSignedUrl: opts => {
                  expect(opts.expires).toBe(1000)
                  return []
                }
              }
            }
          }
        }
      }))

      await get({ filePath: () => 'gs://bucket-test/filename-test', expiresInTimestamp: () => 1000 })()
    })

    it('deve executar a função storage.get com os parametros default', async () => {
      Storage.mockImplementation(() => ({
        bucket: bu => {
          return {
            file: fn => {
              return {
                getSignedUrl: opts => {
                  return []
                }
              }
            }
          }
        }
      }))

      await get({})()
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      Storage.mockImplementation(() => ({
        bucket: () => {
          throw new Error('error test')
        }
      }))

      expect(await get({ fail: (err, ctx) => err.message })()).toBe('error test')
    })

    it('deve estourar exceção caso a função fail não for definida e ocorrer erro', async () => {
      Storage.mockImplementation(() => ({
        bucket: () => {
          throw new Error('error test')
        }
      }))
      try {
        await get({})()
      } catch (err) {
        expect(err.message).toBe('error test')
      }
    })
  })
})
