import assert from 'assert'
import minimist from 'minimist'
import SMTP2API from '../smtp2api'

const argv = minimist(process.argv.slice(2))
const endpoint = argv.e || argv.endpoint
const port = argv.p || argv.port || process.env.PORT || 25

assert(
  endpoint,
  `API endpoint should be defined to send emails to (-e, --endpoint)`
)
;(function smtp2apiServer() {
  try {
    const smtp = SMTP2API({ endpoint })
    smtp.startServer(port)
    console.log(`listening on *:${port}`)

    const closeServer = () =>
      smtp.closeServer(() => {
        console.log('stopping smtp2api process')
        process.exit()
      })
    process.on('SIGINT', closeServer)
    process.on('SIGTERM', closeServer)
  } catch (err) {
    console.error(err)
    process.exit()
  }
})()
