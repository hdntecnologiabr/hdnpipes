module.exports = ({
  functions = [],
  success = (result, ctx) => ({ result, ctx }),
  fail = (err, ctx) => {
    throw err
  }
}) => async ctx => {
  try {
    const result = await Promise.all(functions.map(async fn => await fn(ctx)))
    return await success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
