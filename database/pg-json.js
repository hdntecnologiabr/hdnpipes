const { Pool } = require('pg')

const pools = {}

const startPools = () => {
  const poolsConfigs = JSON.parse(process.env.DATABASE_PGJSON_POOLSCONFIG || '{}')
  Object.keys(poolsConfigs).forEach(k => {
    const poolId = k
    const connectionString = poolsConfigs[k]
    if (!pools[poolId]) {
      pools[poolId] = new Pool({ connectionString: connectionString })
      pools[poolId].on('error', (err) => {
        console.error(`POOL ${poolId} ERROR:`, err)
        process.exit(-1)
      })
    }
  })
}
startPools()

const defaultPoolIdFn = ctx => ''
const defaultQueryFn = ctx => ['', []]
const defaultSuccessFn = (result, ctx) => ({ result, ctx })
const defaultFailFn = (err, ctx) => { throw err }
const defaultTableFn = ctx => ''
const defaultWhereFn = ctx => ''
const defaultOrderByFn = ctx => ''
const defaultLimitFn = ctx => 50
const defaultOffsetFn = ctx => 0

module.exports.query = ({
  poolId = defaultPoolIdFn,
  query = defaultQueryFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  let client
  try {
    const _poolId = await poolId(ctx)
    const _query = await query(ctx)
    client = await pools[_poolId].connect()
    const result = (await client.query(_query[0], _query[1])).rows.map(d => ({ id: d.id, ...d.body }))
    return await success(result, ctx)
  } catch (err) {
    return await fail(err, err)
  } finally {
    if (client) {
      client.release()
    }
  }
}

const andOrFactory = type => (values = []) => {
  const wh = []
  values.forEach(w => {
    if (typeof w === 'string') {
      wh.push(w)
    }
    if (Array.isArray(w)) {
      const field = w[0] === 'id' ? 'id' : `body->>'${w[0]}'`
      const operator = w[1]
      const value = w[2]
      wh.push(`${field}${operator}'${value}'`)
    }
  })
  return wh.length > 0 ? `(${wh.join(` ${type} `)})` : ''
}

module.exports.and = (...values) => andOrFactory('and')(values)

module.exports.or = (...values) => andOrFactory('or')(values)

module.exports.find = ({
  poolId = defaultPoolIdFn,
  table = defaultTableFn,
  where = defaultWhereFn,
  orderBy = defaultOrderByFn,
  limit = defaultLimitFn,
  offset = defaultOffsetFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  let client
  try {
    const _poolId = await poolId(ctx)
    const _table = await table(ctx)
    const _where = await where(ctx)
    const _orderBy = await orderBy(ctx)
    const _limit = await limit(ctx)
    const _offset = await offset(ctx)
    if (!_poolId || !_table) throw new Error('poolId and table is required')
    const query = [`select * from ${_table}`]
    if (_where) {
      query.push(`where ${_where} `)
    }
    if (_orderBy) {
      query.push(`order by ${_orderBy === 'id' ? _orderBy : `body->>'${_orderBy}'`}`)
    }
    query.push(`limit ${_limit}`)
    query.push(`offset ${_offset}`)
    const queryStr = query.join(' ')
    console.info('QUERY:', queryStr)
    client = await pools[_poolId].connect()
    const result = (await client.query(queryStr)).rows.map(d => ({ id: d.id, ...d.body }))
    return await success(result, ctx)
  } catch (err) {
    return await fail(err, err)
  } finally {
    if (client) {
      client.release()
    }
  }
}
