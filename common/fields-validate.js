const Validator = require('fastest-validator')

const v = new Validator()

module.exports = ({
  schema = ctx => ({}),
  data = ctx => ({}),
  validationFail = (errors, ctx) => ({ errors, ctx }),
  fail = (err, ctx) => { throw err }
}) => async ctx => {
  try {
    const _schema = await schema(ctx)
    const _data = await data(ctx)
    const result = await v.validate(_data, _schema)
    if (result === true) return ctx
    return await validationFail(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
