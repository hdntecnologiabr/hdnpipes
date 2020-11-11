module.exports = ({
  validation = ctx => true,
  fail = ctx => ctx
}) => async ctx => {
  if (!await validation(ctx)) return fail(ctx)
  return (ctx)
}
