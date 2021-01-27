# SMTP2API

Small SMTP server that can take incoming emails and send them to an API that you specify.

## Install

```sh
$ npm install -s smtp2api
```

## Why?

I wanted a way to take emails and forward them in an easy to consume format to an API.
At the time of building I didn't find any good tools that supported this use case
so figured building a lightweight SMTP server to do it for me would be the easiest
way to go.

In particular you can setup this server on a publically facing machine, create an MX DNS
record pointing to it, and send emails to an email on that domain to forward those emails to an
API.

### I only want to use this for one email address in my domain though...?

If you already have an email provider like O365 or GSuite that is wired up to your domain
and you would like this to only apply to emails sent to a specific email address, you can solve
this by setting up an MX record on a sub domain and auto forward emails from the email address
on your main domain to any email address on your smtp2api server.

For example, if you want to send emails sent to `noreply@mydomain.com` to an API using smtp2api and mydomain.com is already using GSuite, you could setup an MX record for the subdomain `smtp2api.mydomain.com` pointing to your smtp2api server, autoforward emails sent to `noreply@mydomain.com` to `noreply@smtp2api.mydomain.com` in GSuite, and those emails would now go to your API.

## Simple Usage

With the small script below you can use HELO, EHLO, or any other
email client to send an email to your API listening locally
on port 8000 as JSON with HTTP header `Content-type: application/json`.

```ts
import SMTP2API from 'smtp2api'

const port = 25
const smtp = SMTP2API({ endpoint: `http://localhost:8000/my/api` })
smtp.startServer(port)
console.log(`listening on *:${port}`)
```

## CLI

### Standalone

```sh
$ npm install -g smtp2api
$
$ # start SMTP server listening on port 25 that
$ # sends emails to an API on localhost:8000
$ smtp2api -e http://localhost:8000/my/api -p 25
listening on *:25
```

### Docker

```sh
$ git clone https://github.com/whatl3y/smtp2api
$ cd smtp2api
$ docker build -t smtp2api .
$ docker run -e SMTP2API_ENDPOINT=http://localhost:8000/my/api -e PORT=25 smtp2api
```

## API

```js
import SMTP2API from 'smtp2api'

const smtp = SMTP2API(opts) // opts: SMTP2APIOptions
smtp.startServer(port) // port: number (default: 25)
console.log(`listening on *:${port}`)
```

- **opts**: SMTP2APIOptions
  - **endpoint**: REQUIRED - endpoint of your API to send emails to. This is the only required option
  - **apiAuth?**: optional object of options to use to authenticate with your API endpoint
    - **basic?**: username/password to authenticate using Basic auth
    - **header?**: key/value pair of a header that will be added to the request to your API
    - **custom?**: custom function to be executed to populate authentication headers of the request to your API
  - **smtpAuth?**: optional object with username/password combo to require clients to authenticate as. NOTE If **onAuth** is provided, it takes precedent and this will not be used.
    - **username**: username to require clients to use to authenticate with the SMTP server
    - **password**: password to require clients to use to authenticate with the SMTP server
  - **onAuth?**: optional function to use to authenticate clients. Please [follow the documentation here](https://nodemailer.com/extras/smtp-server/#handling-authentication) if using this function. NOTE this will be used and **smtpAuth** ignored if this is provided.
  - **onDataCallback?**: optional function to be called to do your own processing of an email when one has been sent. Please [follow the documentation here](https://nodemailer.com/extras/smtp-server/#processing-incoming-message) if using this, and ensure you invoke _callback(err, obj)_ with the specified params at the end of your custom logic.

## Testing

### Simple API Server

If you'd like to test your SMTP server against a small API to see
what the output looks like, we ship an API server that you can
use to log the output of an incoming email.

```sh
$ # Start a simple API server you can send emails to any route
$ # that will listen in port 8080
$ #
$ # use `$ smtp2api -e http://localhost:8080/test` to pass emails
$ # to this server.
$ npx smtp2apiApiServer
```
