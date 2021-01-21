const nodemailer = require('nodemailer')

const defaultTransporterNameFn = ctx => ''

const defaultTransporterHostFn = ctx => ''

const defaultTransporterPortFn = ctx => ''

const defaultTransporterSecureFn = ctx => false

const defaultTransporterUser = ctx => ''

const defaultTransporterPassword = ctx => ''

const defaultReceiversFn = ctx => []

const defaultSubjectFn = ctx => ''

const defaultTextFn = ctx => ''

const defaultHtmlFn = ctx => ''

const defaultAttachmentsFn = ctx => undefined

const defaultSenderNameFn = ctx => ''

const defaultSenderEmailFn = ctx => ''

const defaultSuccessFn = (result, ctx) => ({ result, ctx })

const defaultFailFn = (err, ctx) => {
  throw err
}

module.exports.sendEmail = ({
  transporterName = defaultTransporterNameFn,
  transporterHost = defaultTransporterHostFn,
  transporterPort = defaultTransporterPortFn,
  transporterSecure = defaultTransporterSecureFn,
  transporterUser = defaultTransporterUser,
  transporterPassword = defaultTransporterPassword,
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
    const _transporterName = await transporterName(ctx)
    const _transporterHost = await transporterHost(ctx)
    const _transporterPort = await transporterPort(ctx)
    const _transporterSecure = await transporterSecure(ctx)
    const _transporterUser = await transporterUser(ctx)
    const _transporterPassword = await transporterPassword(ctx)
    const _receivers = await receivers(ctx)
    const _subject = await subject(ctx)
    const _text = await text(ctx)
    const _html = await html(ctx)
    const _attachments = await attachments(ctx)
    const _senderName = await senderName(ctx)
    const _senderEmail = await senderEmail(ctx)

    const transporter = nodemailer.createTransport({
      name: _transporterName,
      host: _transporterHost,
      port: _transporterPort,
      secure: _transporterSecure,
      auth: {
        user: _transporterUser,
        pass: _transporterPassword
      }
    })

    const result = await transporter.sendMail({
      from: `"${_senderName}" ${_senderEmail}`,
      to: _receivers.reduce(
        (to, currentReceiver, index) =>
          to + (index === 0 ? '' : ' ') + currentReceiver,
        ''
      ),
      subject: _subject,
      text: _text,
      html: _html,
      attachments: _attachments
    })

    return success(result, ctx)
  } catch (err) {
    return fail(err, ctx)
  }
}
