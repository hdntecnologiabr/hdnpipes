module.exports = ({
  functions = [],
  fail = (err, ctx) => { throw err }
}) => async ctx => {
  try {
    let current = ctx
    for (const i in functions) {
      current = await functions[i](current)
    }
    return current
  } catch (err) {
    return fail(err, ctx)
  }
}