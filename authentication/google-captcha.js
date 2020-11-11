const defaultCaptchaTokenFn = ctx => ''

const defaultFailFn = (err, ctx) => { throw err }

const defaultSuccessFn = (result, ctx) => ({ ctx, result })

module.exports.checkV3 = ({
  captchaToken = defaultCaptchaTokenFn,
  fail = defaultFailFn,
  success = defaultSuccessFn
},
secretKey$ = process.env.GOOGLE_CAPTCHA_V3_SECRET_KEY,
axios$ = require('axios')
) => async ctx => {
  try {
    const _captchaToken = await captchaToken(ctx)
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey$}&response=${_captchaToken}`
    const result = await axios$.default({
      url,
      method: 'POST'
    })
    if (!result.data.success) return await fail(new Error(JSON.stringify(result.data['error-codes'])), ctx)
    return await success(result, ctx)
  } catch (err) {
    return await fail(err, ctx)
  }
}
