import minimist from 'minimist'
import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'

const argv = minimist(process.argv.slice(2))
const port = argv.p || argv.port || 8080
;(async function apiServer() {
  try {
    const app = express()
    app.use(bodyParser.json({ limit: '5mb' }))
    app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))
    app.all('*', function(req: Request, res: Response) {
      console.log(`query string`, req.query)
      console.log(`request body`, req.body)
      res.sendStatus(200)
    })

    app.listen(port, () => console.log(`listening on *:${port}`))
  } catch (err) {
    console.error(err)
    process.exit()
  }
})()
