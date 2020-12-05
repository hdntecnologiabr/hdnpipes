const { Pool } = require('pg')

const pools = {}

const poolsConfigs = Object.keys(process.env).filter(k => k.includes('DATABASE_PGJSON_CONNECTION_'))
poolsConfigs.forEach(k => {
  const poolConfig = process.env[k]
  const [poolid, connectionString] = poolConfig.split('::')
  if (!pools[poolid]) {
    pools[poolid] = new Pool({ connectionString: connectionString })
    pools[poolid].on('error', (err) => {
      console.error(`POOL ${poolid} ERROR:`, err)
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
