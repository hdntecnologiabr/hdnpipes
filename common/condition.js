module.exports = ({
  condition = (ctx) => true,
  isTrue = (ctx) => ctx,
  isFalse = (ctx) => ctx
}) => async ctx => {
  if (await condition(ctx)) return isTrue(ctx)
  return isFalse(ctx)
}
