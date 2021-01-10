# SMTP2API

Small SMTP server that can take incoming emails and send them to
an API that you specify.

## Install

```sh
$ npm install -s smtp2api
```

## Simple Usage

With the small script below you can use HELO, EHLO, or any other
email client to send an email to your API listening locally
on port 8000 as JSON with Content-type: application/json.

```ts
import SMTP2API from 'smtp2api'

const port = 25
const smtp = SMTP2API({ endpoint: `http://localhost:8000/my/api` })
smtp.startServer(port)
console.log(`listening on *:${port}`)
```

## CLI

```sh
$ npm install -g smtp2api
$
$ # start SMTP server listening on port 25 that
$ # sends emails to an API on localhost
$ smtp2api -e http://localhost:8000/my/api -p 25
listening on *:25
```

## API

```js
import SMTP2API, { SMTP2APIOptions } from 'smtp2api'

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

### API Server

If you'd like to test your SMTP server against a small API to see
what the output looks like, we ship a dead simple API server that you can
use to log the output.

```sh
$ # Start a simple API server you can send emails to any route
$ # that will listen in port 8080
$ # use `$ smtp2api -e http://localhost:8080/test` to pass emails
$ # to this server.
$ npx smtp2apiApiServer
```
