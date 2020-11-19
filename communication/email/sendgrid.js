const sendgrid = require('@sendgrid/mail')

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const defaultReceiversFn = ctx => []

const defaultSubjectFn = ctx => ''

const defaultTextFn = ctx => undefined

const defaultHtmlFn = ctx => ''

const defaultAttachmentsFn = ctx => undefined

const defaultSenderNameFn = ctx => ''

const defaultSenderEmailFn = ctx => ''

const defaultSuccessFn = (result, ctx) => ({ result, ctx })

const defaultFailFn = (err, ctx) => {
  throw err
}

module.exports.sendEmail = ({
  receivers = defaultReceiversFn,
  subject = defaultSubjectFn,
  text = defaultTextFn,
  html = defaultHtmlFn,
  attachments = defaultAttachmentsFn,
  senderName = defaultSenderNameFn,
  senderEmail = defaultSenderEmailFn,
  success = defaultSuccessFn,
  fail = defaultFailFn
}) => async ctx => {
  try {
    const _receivers = receivers(ctx)
    const _subject = subject(ctx)
    const _text = text(ctx)
    const _html = html(ctx)
    const _attachments = attachments(ctx)
    const _senderName = senderName(ctx)
    const _senderEmail = senderEmail(ctx)

    const msg = {
      to: _receivers,
      from: {
        name: _senderName,
        email: _senderEmail
      },
      text: _text,
      subject: _subject,
      html: _html,
      attachments: _attachments
    }

    const result = await sendgrid.send(msg)

    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
