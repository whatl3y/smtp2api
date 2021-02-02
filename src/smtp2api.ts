import assert from 'assert'
import axios from 'axios'
import { simpleParser, Attachment, EmailAddress } from 'mailparser'
import {
  SMTPServerAuthentication,
  SMTPServerAuthenticationResponse,
  SMTPServerDataStream,
  SMTPServerSession,
  SMTPServer,
} from 'smtp-server'

export type SMTP2APIAttachment = Attachment & {
  content: string
}

export interface ApiMailBody {
  headers: StringMap
  from?: EmailAddress[]
  to?: EmailAddress[]
  subject?: string
  html?: string | false
  text?: string
  textHtml?: string
  attachments?: SMTP2APIAttachment[]
}

export type OnAuthCallback = (
  err: Error | null | undefined,
  response?: SMTPServerAuthenticationResponse
) => void

export type onDataCallback = (err?: Error | null) => void

export interface StringMap {
  [key: string]: any
}

export type HttpHeaders = StringMap

export interface APIAuthOptions {
  custom?: () => HttpHeaders
  basic?: SMTP2APIBasicAuthOptions
  header?: SMTP2APIHeaderAuthOptions
}

export interface SMTP2APIHeaderAuthOptions {
  key: string
  value: string
}

export interface SMTP2APIBasicAuthOptions {
  username: string
  password: string
}

export interface SMTP2APIOptions {
  apiAuth?: APIAuthOptions
  smtpAuth?: SMTP2APIBasicAuthOptions
  onAuth?: (
    auth: SMTPServerAuthentication,
    session: SMTPServerSession,
    callback: (
      err: Error | null | undefined,
      response?: SMTPServerAuthenticationResponse
    ) => void
  ) => void
  onDataCallback?: (
    stream: SMTPServerDataStream,
    session: SMTPServerSession,
    callback: (err?: Error | null) => void
  ) => void
  endpoint: string
}

export default function SMTP2API({
  apiAuth,
  smtpAuth,
  onAuth,
  onDataCallback,
  endpoint,
}: SMTP2APIOptions) {
  function buildApiAuthHeaders(): HttpHeaders {
    let header: HttpHeaders = {}

    if (apiAuth?.custom) {
      header = apiAuth.custom()
    }

    if (apiAuth?.basic) {
      const { username, password } = apiAuth.basic
      header['Authorization'] = `Basic ${Buffer.from(
        `${username}:${password}`
      ).toString('base64')}`
    }

    if (apiAuth?.header) {
      const { key, value } = apiAuth.header
      header[key] = value
    }

    return header
  }

  return {
    server: new SMTPServer({
      authOptional: !onAuth && !(smtpAuth && smtpAuth.username),

      onAuth:
        onAuth ||
        function(
          { username, password }: SMTPServerAuthentication,
          session: SMTPServerSession,
          callback: OnAuthCallback
        ) {
          try {
            if (smtpAuth && smtpAuth.username) {
              assert(smtpAuth.username === username, 'username is not valid')
              assert(smtpAuth.password === password, 'password is not valid')
            }
            callback(null, { user: username || 'default' })
          } catch (err) {
            callback(err)
          }
        },

      async onData(
        stream: SMTPServerDataStream,
        session: SMTPServerSession,
        callback: onDataCallback
      ) {
        try {
          // https://nodemailer.com/extras/mailparser/#mail-object
          const mail = await simpleParser(stream)
          const headers = buildApiAuthHeaders()

          const mailBody: ApiMailBody = {
            headers: Object.fromEntries(mail.headers),
            from: mail.from?.value,
            to: mail.to?.value,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            textHtml: mail.textAsHtml,
            attachments: mail.attachments.map((a) => ({
              ...a,
              content: a.content.toString('base64'),
            })) as SMTP2APIAttachment[],
          }

          await axios.post(endpoint, mailBody, { headers })

          // if the user provides an extra onData function, have them
          // execute the callback instead of us
          if (onDataCallback) return onDataCallback(stream, session, callback)

          callback()
        } catch (err) {
          callback(err)
        }
      },
    }),

    startServer(port: number = 25) {
      this.server.listen(port)
    },

    closeServer(cb: () => void = () => {}) {
      this.server.close(cb)
    },
  }
}
