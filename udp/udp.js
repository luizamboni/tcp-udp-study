const dgram = require('dgram')
const server = dgram.createSocket('udp4')


const PORT = 44444

server.on('error', err => {
  console.error(`server error:\n${err.stack}`)
  server.close()
})

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
})

server.on('listening', () => {
  const address = server.address()
  console.log(`server listening ${address.address}:${address.port}`)
})

server.bind(PORT)

// client part
const buf1 = Buffer.from('Some ')
const buf2 = Buffer.from('bytes')
const client = dgram.createSocket('udp4')

client.send([buf1, buf2], PORT, err => {
  client.close()
})
