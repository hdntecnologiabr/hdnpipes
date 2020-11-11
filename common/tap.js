module.exports = tapfn => async ctx => {
  await tapfn(ctx)
  return ctx
}
