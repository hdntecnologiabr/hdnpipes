module.exports = ({
  collection = ctx => [],
  success = (result, ctx) => ctx,
  exec = (item, index, ctx) => {},
  fail = (err, ctx) => {
    throw err
  }
}) => async ctx => {
  try {
    const _collection = await collection(ctx)
    const result = []
    for (const i in _collection) {
      result.push(await exec(_collection[i], i, ctx))
    }
    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
