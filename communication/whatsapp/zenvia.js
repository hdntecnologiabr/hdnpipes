const axios = require('axios').default

const defaultTokenFn = ctx => ''

const defaultSenderFn = ctx => ''

const defaultReceiverFn = ctx => ''

const defaultMessagesFn = ctx => ''

const defaultSuccessFn = (result, ctx) => ({ result, ctx })

const defaultFailFn = (err, ctx) => {
  throw err
}

module.exports.sendMessage = ({
  token = defaultTokenFn,
  sender = defaultSenderFn,
  receiver = defaultReceiverFn,
  messages = defaultMessagesFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  try {
    const _token = await token(ctx)
    const _sender = await sender(ctx)
    const _receiver = await receiver(ctx)
    const _messages = await messages(ctx)

    const result = await axios({
      method: 'POST',
      url: 'https://api.zenvia.com/v2/channels/whatsapp/messages',
      headers: {
        'X-API-TOKEN': _token,
        'Content-Type': 'application/json'
      },
      data: {
        from: _sender,
        to: _receiver,
        contents: _messages
      }
    })

    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
