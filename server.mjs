// Arranque del servidor estático en Railway (ver server/estatico.mjs y railway.json).
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { crearManejador } from './server/estatico.mjs'

const raiz = fileURLToPath(new URL('./dist/', import.meta.url))
const puerto = Number(process.env.PORT) || 8080

createServer(crearManejador(raiz)).listen(puerto, () => {
  console.log(`ReciclaXP: sirviendo ${raiz} en el puerto ${puerto} (app general en / y caso club en /club/)`)
})
