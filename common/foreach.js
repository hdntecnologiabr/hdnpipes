module.exports = ({
  collection = (ctx) => [],
  exec = (item, index, ctx) => {},
  fail = (err, ctx) => { throw err }
}) => async ctx => {
  try {
    const _collection = await collection(ctx)
    for (const i in _collection) {
      await exec(_collection[i], i, ctx)
    }
    return ctx
  } catch (err) {
    return fail(err, ctx)
  }
}
