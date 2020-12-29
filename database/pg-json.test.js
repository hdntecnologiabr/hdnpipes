const { Pool } = require('pg')
const {
  startPools,
  query,
  and,
  or,
  find,
  save,
  remove,
  transaction
} = require('./pg-json')

jest.mock('pg')

describe('postgres module', () => {

  beforeAll(() => {
    process.env.DATABASE_PGJSON_POOLSCONFIG = '{"cooperativeId": "cooperativeId"}' || '{}'
  })

  describe('start pools', () => {
    it('iniciando as pools', () => {
      Pool.mockImplementation(({ connectionString }) => {
        expect(connectionString).toEqual('cooperativeId')
        return {
          connectionString,
          callbacks: { error: '' },
          on: (e, callback) => {
            expect(e).toEqual('error')
            callback()
          },
          connect: () => {
            return { query: (queryText, values) => [{ queryText: queryText, values: values }] }
          }
        }
      })
      startPools()
      startPools()
    })
  })

  describe('query function', () => {
    beforeEach(() => {
      Pool.mockReset()
    })

    it('deve testar o default da função, causando um erro pela falta do poolId', async () => {
      const queryFn = query({})
      try {
        await queryFn()
      } catch (err) {
        expect(err.message).toBe("Cannot read property 'transaction' of undefined")
      }
    })

    it('deve passar os parâmetros para a função', async () => {
      const ctx = {
        poolId: 'cooperativeId',
        transaction: 'transaction',
        query: ['', []],
        success: []
      }
      const queryFn = query({
        poolId: (ctx) => {
          expect(ctx.poolId).toBe('cooperativeId')
          return ctx.poolId
        },
        transaction: (ctx) => {
          expect(ctx.transaction).toBe('transaction')
          return ctx.transaction
        },
        query: (ctx) => (['', []]),
        success: (result, ctx) => {
          expect(ctx.success).toBe([])
          return ctx.success
        }
      })
      await queryFn({
        poolId: 'cooperativeId',
        transaction: 'transaction',
        query: ['', []],
        success: []
      })
    })

  })

  /*describe('find function', () => {
    beforeEach(() => {
      Pool.mockReset()
    })

    it('deve passar os parametros corretos para a função postgres.find do postgres', async () => {
      Pool.mockImplementation(() => ({
        collection: cl => {
          expect(cl).toBe('collection test')
          return {
            doc: dc => {
              expect(dc).toBe(undefined)
              return {
                set: dt => {
                  expect(dt.test).toBe('data test')
                }
              }
            }
          }
        }
      }))
      await find({
        table: ctx => 'table test',
        data: ctx => ({ test: 'data test' })
      })()
    })

    it('deve passar os parametros corretos para a função firestore.add do postgres com uma transaction', async () => {
      Firestore.mockImplementation(() => ({
        collection: cl => {
          expect(cl).toBe('collection test')
          return {
            doc: dc => {
              expect(dc).toBe(undefined)
              return 'doc ref test'
            }
          }
        }
      }))
      const mockTransaction = ctx => ({
        set: (dr, dt) => {
          expect(dr).toBe('doc ref test')
          expect(dt.test).toBe('data test')
        }
      })

      await add({
        collection: ctx => 'collection test',
        data: ctx => ({ test: 'data test' }),
        transaction: mockTransaction
      })()
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      Firestore.mockImplementation(() => {
        throw new Error('error test')
      })
      expect(await add({ fail: (err, ctx) => err.message })()).toBe(
        'error test'
      )
    })

    it('deve estourar exceção caso a função fail não for definida e ocorrer erro', async () => {
      Firestore.mockImplementation(() => ({
        collection: cl => {
          throw new Error('error test')
        }
      }))
      try {
        await add({})()
      } catch (err) {
        expect(err.message).toBe('error test')
      }
    })
  })

  describe('get function', () => {
    beforeEach(() => {
      Firestore.mockReset()
      clearFirestoreClient()
    })

    it('deve passar os parametros corretos para a função firestore.get do firebase', async () => {
      Firestore.mockImplementation(() => ({
        doc: cdc => {
          expect(cdc).toBe('collection test/doc test')
          return {
            get: () => {
              return {
                data: () => ({})
              }
            }
          }
        }
      }))
      await get({
        collection: cxt => 'collection test',
        doc: ctx => 'doc test'
      })()
    })

    it('deve passar os parametros corretos para a função firestore.get do firebase com uma transaction', async () => {
      Firestore.mockImplementation(() => ({
        doc: cdc => {
          expect(cdc).toBe('collection test/doc test')
          return 'doc ref test'
        }
      }))
      const mockTransaction = ctx => ({
        get: dr => {
          expect(dr).toBe('doc ref test')
          return { data: () => ({}) }
        }
      })

      await get({
        collection: cxt => 'collection test',
        doc: ctx => 'doc test',
        transaction: mockTransaction
      })()
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      Firestore.mockImplementation(() => {
        throw new Error('error test')
      })
      expect(await get({ fail: (err, ctx) => err.message })()).toBe(
        'error test'
      )
    })

    it('deve estourar exceção caso a função fail não for definida e ocorrer erro', async () => {
      Firestore.mockImplementation(() => ({
        doc: cl => {
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

  describe('find function', () => {
    beforeEach(() => {
      Firestore.mockReset()
      clearFirestoreClient()
    })

    it('deve passar os parametros corretos para a função firestore.find do firebase', async () => {
      const mockWhere = [['test', '==', 'test']]

      const queryObject = {
        query: [],
        get: () => ({
          docs: [
            {
              id: 'id',
              data: () => ({
                test: 1,
                createdAt: { seconds: 0 },
                updatedAt: { seconds: 0 }
              })
            }
          ]
        }),
        where: (key, operation, value) => {
          expect(
            mockWhere.some(
              element =>
                element[0] === key &&
                element[1] === operation &&
                element[2] === value
            )
          ).toBe(true)
          queryObject.query.push([key, operation, value])
          return queryObject
        }
      }
      Firestore.mockImplementation(() => ({
        collection: cl => {
          expect(cl).toBe('collection test')
          return queryObject
        }
      }))
      await find({
        collection: cxt => 'collection test',
        where: ctx => mockWhere
      })()
    })

    it('deve passar os parametros corretos para a função firestore.find do firebase com orderBy, offset e limit', async () => {
      const mockWhere = [['test', '==', 'test']]

      const queryObject = {
        query: [],
        get: () => ({
          docs: [
            {
              id: 'id',
              data: () => ({
                test: 1,
                createdAt: { seconds: 0 },
                updatedAt: { seconds: 0 }
              })
            }
          ]
        }),
        where: (key, operation, value) => {
          expect(
            mockWhere.some(
              element =>
                element[0] === key &&
                element[1] === operation &&
                element[2] === value
            )
          ).toBe(true)
          queryObject.query.push([key, operation, value])
          return queryObject
        },
        orderBy: (ob, oba) => {
          expect(ob).toBe('test orderBy')
          expect(oba).toBe('desc')
          return queryObject
        },
        limit: lt => {
          expect(lt).toBe(1)
          return queryObject
        },
        offset: ofs => {
          expect(ofs).toBe(10)
          return queryObject
        }
      }
      Firestore.mockImplementation(() => ({
        collection: cl => {
          expect(cl).toBe('collection test')
          return queryObject
        }
      }))
      await find({
        collection: cxt => 'collection test',
        where: ctx => mockWhere,
        limit: () => 1,
        offset: () => 10,
        orderBy: () => 'test orderBy',
        orderByAsc: () => false
      })()

      queryObject.orderBy = (ob, oba) => {
        expect(ob).toBe('test orderBy')
        expect(oba).toBe('asc')
        return queryObject
      }

      await find({
        collection: cxt => 'collection test',
        where: ctx => mockWhere,
        limit: () => 1,
        offset: () => 10,
        orderBy: () => 'test orderBy',
        orderByAsc: () => true
      })()
    })

    it('deve passar os parametros corretos para a função firestore.find do firebase com uma transaction', async () => {
      const mockWhere = [['test', '==', 'test']]

      const queryObject = {
        query: [],
        orderBy: ob => {
          expect(ob).toBe('createdAt')
          return {
            startAfter: offset => {
              expect(offset).toBe(0)
              return {
                limit: limit => {
                  expect(limit).toBe(500)
                }
              }
            }
          }
        },
        get: () => ({ docs: [] }),
        where: (key, operation, value) => {
          expect(
            mockWhere.some(
              element =>
                element[0] === key &&
                element[1] === operation &&
                element[2] === value
            )
          ).toBe(true)
          queryObject.query.push([key, operation, value])
          return queryObject
        }
      }

      Firestore.mockImplementation(() => ({
        collection: cl => {
          expect(cl).toBe('collection test')
          return queryObject
        }
      }))

      const mockTransaction = ctx => ({
        get: qr => {
          expect(qr.query).toEqual(mockWhere)
          return { docs: [] }
        }
      })
      await find({
        collection: cxt => 'collection test',
        where: ctx => mockWhere,
        transaction: mockTransaction
      })()
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      Firestore.mockImplementation(() => {
        throw new Error('error test')
      })
      expect(await find({ fail: (err, ctx) => err.message })()).toBe(
        'error test'
      )
    })

    it('deve estourar exceção caso a função fail não for definida e ocorrer erro', async () => {
      Firestore.mockImplementation(() => ({
        collection: cl => {
          throw new Error('error test')
        }
      }))
      try {
        await find({})()
      } catch (err) {
        expect(err.message).toBe('error test')
      }
    })
  })

  describe('delete function', () => {
    beforeEach(() => {
      Firestore.mockReset()
      clearFirestoreClient()
    })

    it('deve passar os parametros corretos para a função firestore.delete do firebase', async () => {
      Firestore.mockImplementation(() => ({
        doc: cdc => {
          expect(cdc).toBe('collection test/doc test')
          return {
            delete: () => { }
          }
        }
      }))
      await fdelete({
        collection: cxt => 'collection test',
        doc: ctx => 'doc test'
      })()
    })

    it('deve passar os parametros corretos para a função firestore.delete do firebase com uma transaction', async () => {
      Firestore.mockImplementation(() => ({
        doc: cdc => {
          expect(cdc).toBe('collection test/doc test')
          return 'doc ref test'
        }
      }))

      const mockTransaction = ctx => ({
        delete: dr => {
          expect(dr).toEqual('doc ref test')
        }
      })
      await fdelete({
        collection: cxt => 'collection test',
        doc: ctx => 'doc test',
        transaction: mockTransaction
      })()
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      Firestore.mockImplementation(() => {
        throw new Error('error test')
      })
      expect(await fdelete({ fail: (err, ctx) => err.message })()).toBe(
        'error test'
      )
    })

    it('deve estourar exceção caso a função fail não for definida e ocorrer erro', async () => {
      Firestore.mockImplementation(() => ({
        doc: cl => {
          throw new Error('error test')
        }
      }))
      try {
        await fdelete({})()
      } catch (err) {
        expect(err.message).toBe('error test')
      }
    })
  })

  describe('transaction function', () => {
    beforeEach(() => {
      Firestore.mockReset()
      clearFirestoreClient()
    })

    it('deve passar os parametros corretos para a função firestore.transaction do firebase', async () => {
      Firestore.mockImplementation(() => ({
        runTransaction: async fn => {
          const result = await fn([])
          expect(result).toEqual({ transaction: ['a'] })
        }
      }))

      await transaction({
        functions: [c => ({ ...c, transaction: [...c.transaction, 'a'] })]
      })({})
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      Firestore.mockImplementation(() => {
        throw new Error('error test')
      })
      expect(await transaction({ fail: (err, ctx) => err.message })()).toBe(
        'error test'
      )
    })
  })*/
})
