const { send, setApiKey } = require('@sendgrid/mail')
const { sendEmail } = require('./sendgrid')

jest.mock('@sendgrid/mail')

describe('sendgrid module', () => {
  beforeAll(() => {
    send.mockImplementation(() => {})
    setApiKey.mockImplementation(() => {})
  })

  describe('sendEmail function', () => {
    beforeEach(() => {
      send.mockReset()
    })
    it('deve passar os parametros corretos para a função sendgrid.sendEmail', async () => {
      const ctx = {
        attachments: ['attachment'],
        html: 'html test',
        receivers: ['receiver test'],
        senderEmail: 'senderEmail test',
        senderName: 'senderName test',
        subject: 'subject test',
        text: 'text test'
      }

      send.mockImplementation(
        ({ to, from, text, subject, html, attachments }) => {
          expect(to).toEqual(['receiver test'])
          expect(from).toEqual({
            name: 'senderName test',
            email: 'senderEmail test'
          })
          expect(text).toBe('text test')
          expect(subject).toBe('subject test')
          expect(html).toBe('html test')
          expect(attachments).toEqual(['attachment'])
        }
      )

      const sendEmailFn = sendEmail({
        attachments: ctx => ctx.attachments,
        html: ctx => ctx.html,
        receivers: ctx => ctx.receivers,
        senderEmail: ctx => ctx.senderEmail,
        senderName: ctx => ctx.senderName,
        subject: ctx => ctx.subject,
        text: ctx => ctx.text
      })

      await sendEmailFn(ctx)
    })

    it('deve passar como parametro o erro e o contexto para a função fail caso ocorrer erro', async () => {
      send.mockImplementation(() => {
        throw new Error('error test')
      })

      expect(await sendEmail({ fail: (err, ctx) => err.message })()).toBe(
        'error test'
      )
    })

    it('deve estourar exceção caso a função fail não for definida e ocorrer erro', async () => {
      send.mockImplementation(() => {
        throw new Error('error test')
      })
      try {
        await sendEmail({})()
      } catch (err) {
        expect(err.message).toBe('error test')
      }
    })
  })
})
