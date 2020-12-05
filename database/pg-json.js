const { Pool } = require('pg')

const pools = {}

const poolsConfigs = JSON.parse(process.env.DATABASE_PGJSON_POOLSCONFIG)
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

const defaultPoolIdFn = ctx => ''
const defaultQueryFn = ctx => ['', []]
const defaultSuccessFn = (result, ctx) => ({ result, ctx })
const defaultFailFn = (err, ctx) => { throw err }

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
