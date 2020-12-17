const { PubSub } = require('@google-cloud/pubsub')

const defaultTopicFn = ctx => ''
const defaultPayloadFn = ctx => ({})
const defaultFailFn = (err, ctx) => { throw err }
const defaultSuccessFn = (result, ctx) => ({ result, ctx })

module.exports.publish = ({
  topic = defaultTopicFn,
  payload = defaultPayloadFn,
  fail = defaultFailFn,
  success = defaultSuccessFn
}) => async ctx => {
  try {
    const _topic = await topic(ctx)
    const _payload = await payload(ctx)
    const pubsubClient = new PubSub({ keyFilename: process.env.MESSAGING_GCPUBSUB_KEYFILENAME })
    const [t] = await pubsubClient.topic(_topic).get({ autoCreate: true })
    const result = await t.publishJSON(_payload)
    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
