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
const defaultTransactionFn = ctx => ctx.transaction
const defualtDataFn = ctx => ({})
const defaultIdFn = ctx => ''
const defaultDenormalizeFn = ctx => []

module.exports.query = ({
  poolId = defaultPoolIdFn,
  transaction = defaultTransactionFn,
  query = defaultQueryFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  let client
  try {
    const _poolId = await poolId(ctx)
    const _transaction = await transaction(ctx)
    const _query = await query(ctx)
    if (!_transaction) {
      client = await pools[_poolId].connect()
    }
    const result = (_transaction ? await transaction.query(_query[0], _query[1]) : await client.query(_query[0], _query[1])).rows.map(d => ({ id: d.id, ...d.body }))
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
      const value = operator === 'in' ? w[2] : `'${w[2]}'`
      wh.push(`${field} ${operator} ${value}`)
    }
  })
  return wh.length > 0 ? `(${wh.join(` ${type} `)})` : ''
}

module.exports.and = (...values) => andOrFactory('and')(values)

module.exports.or = (...values) => andOrFactory('or')(values)

module.exports.find = ({
  poolId = defaultPoolIdFn,
  transaction = defaultTransactionFn,
  table = defaultTableFn,
  where = defaultWhereFn,
  denormalize = defaultDenormalizeFn,
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
    const _transaction = await transaction(ctx)
    const _where = await where(ctx)
    const _denormalize = await denormalize(ctx)
    const _orderBy = await orderBy(ctx)
    const _limit = await limit(ctx)
    const _offset = await offset(ctx)

    if (!_poolId && !_transaction) throw new Error('poolId or trasaction is required')
    if (!_table) throw new Error('table is required')

    const denormalizedTables = _denormalize.length
      ? ',' + _denormalize.map(([table, baseField, joinField, denormalizedField], i) => `T${i}.body as ${denormalizedField}`).join(',')
      : ''
    const query = [`select ${_table}.* ${denormalizedTables} from ${_table}`]

    if (_where) {
      query.push(`where ${_where} `)
    }

    if (_denormalize.length) {
      _denormalize.forEach((d, i) => {
        const sqlField = field => table => `cast(${table}.${(field === 'id' ? field : `body->>'${field}'`)} as text)`
        const [table, baseField, joinField] = d
        query.push(`left join ${table} T${i} on ${sqlField(joinField)(`T${i}`)}=${sqlField(baseField)(_table)}`)
      })
    }

    if (_orderBy) {
      query.push(`order by ${_orderBy === 'id' ? _orderBy : `body->>'${_orderBy}'`}`)
    }

    query.push(`limit ${_limit}`)
    query.push(`offset ${_offset}`)
    const queryStr = query.join(' ')
    console.info('QUERY:', queryStr)

    if (!_transaction) {
      client = await pools[_poolId].connect()
    }
    const result = (_transaction
      ? await _transaction.query(queryStr)
      : await client.query(queryStr)
    ).rows
      .map(d => {
        const { id, body, ...rest } = d
        return { id, ...body, ...rest }
      })

    return await success(result, ctx)
  } catch (err) {
    return await fail(err, err)
  } finally {
    if (client) {
      client.release()
    }
  }
}

module.exports.save = ({
  poolId = defaultPoolIdFn,
  transaction = defaultTransactionFn,
  table = defaultTableFn,
  data = defualtDataFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  let client
  try {
    const _poolId = await poolId(ctx)
    const _transaction = await transaction(ctx)
    const _table = await table(ctx)
    const _data = await data(ctx)

    if (!_transaction) {
      client = await pools[_poolId].connect()
    }

    const now = new Date()
    const { id, ...body } = _data
    body.createdAt = id ? body.createdAt : now
    body.updatedAt = now
    const query = id
      ? [`update ${_table} set body=body||$1 where id=$2`, [JSON.stringify(body), id]]
      : [`insert into ${_table}(body) values ($1) returning id`, [JSON.stringify(body)]]

    const res = _transaction
      ? await _transaction.query(query[0], query[1])
      : await client.query(query[0], query[1])

    return await success(res, ctx)
  } catch (err) {
    return await fail(err, ctx)
  } finally {
    if (client) {
      client.release()
    }
  }
}

module.exports.remove = ({
  poolId = defaultPoolIdFn,
  transaction = defaultTransactionFn,
  table = defaultTableFn,
  id = defaultIdFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  let client
  try {
    const _poolId = await poolId(ctx)
    const _transaction = await transaction(ctx)
    const _table = await table(ctx)
    const _id = await id(ctx)
    if (!_transaction) {
      client = await pools[_poolId].connect()
    }
    const query = `delete from ${_table} where id='${_id}'`
    const res = _transaction
      ? await _transaction.query(query)
      : await client.query(query)
    return await success(res, ctx)
  } catch (err) {
    return await fail(err, ctx)
  } finally {
    if (client) {
      client.release()
    }
  }
}

module.exports.transaction = ({
  poolId = defaultPoolIdFn,
  functions = [],
  fail = defaultFailFn
}) => async ctx => {
  let client
  try {
    const _poolId = await poolId(ctx)
    client = await pools[_poolId].connect()
    client.query('BEGIN;')
    ctx.transaction = client
    let current = ctx
    for (const i in functions) {
      current = await functions[i](current)
    }
    client.query('COMMIT;')
    return current
  } catch (err) {
    client.query('ROLLBACK;')
    return await fail(err)
  } finally {
    if (client) {
      client.release()
    }
  }
}
