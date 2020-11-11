const jwt = require('jwt-simple')

const defaultSecret = 'woj1t1915h379t3be539s4b64d14794932'
const defaultHoursToExpire = 8

const convertHoursToMilliseconds = hours => (1000 * 60 * 60 * hours)

module.exports.encode = ({
  payload = ctx => ({}),
  secret = ctx => process.env.AUTHENTICATION_JWT_SECRET || defaultSecret,
  hoursToExpire = ctx => process.env.AUTHENTICATION_JWT_HOURS_TO_EXPIRE || defaultHoursToExpire,
  success = (token, ctx) => ({ token, ctx }),
  fail = (err, ctx) => {
    throw err
  }
}) => async ctx => {
  try {
    const _payload = await payload(ctx)
    const _hoursToExpire = await hoursToExpire(ctx)
    _payload.expirationTimestamp = new Date().getTime() + convertHoursToMilliseconds(_hoursToExpire)
    const _secret = await secret(ctx)
    const token = jwt.encode(_payload, Buffer.from(_secret, 'hex'))
    return success(token, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}

module.exports.decode = ({
  token = ctx => '',
  secret = ctx => process.env.AUTHENTICATION_JWT_SECRET || defaultSecret,
  success = (payload, ctx) => ({ payload, ctx }),
  fail = (err, ctx) => {
    throw err
  }
}) => async ctx => {
  try {
    const _token = await token(ctx)
    const _secret = await secret(ctx)
    const payload = jwt.decode(_token, Buffer.from(_secret, 'hex'))
    if (payload.expirationTimestamp < new Date().getTime()) throw new Error('EXPIRED_TOKEN')
    return success(payload, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
