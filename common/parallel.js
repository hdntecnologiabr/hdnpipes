module.exports = ({
  functions = ctx => [],
  success = (result, ctx) => ({ result, ctx }),
  fail = (err, ctx) => {
    throw err
  }
}) => async ctx => {
  try {
    const _functions = await functions(ctx)
    const result = await Promise.all(_functions.map(async fn => await fn(ctx)))
    return await success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
