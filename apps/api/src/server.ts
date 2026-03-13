import { buildApp } from './app.js'
import { env } from './env.js'

const app = buildApp()

app.listen({ port: env.API_PORT, host: env.API_HOST }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
})
