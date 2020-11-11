module.exports = ({
  defaultFn = ctx => ctx,
  matchings = [],
  fail = (err, ctx) => { throw err }
}) => async ctx => {
  try {
    for (const i in matchings) {
      if (await matchings[i][0](ctx) === true) return await matchings[i][1](ctx)
    }
    return await defaultFn(ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
