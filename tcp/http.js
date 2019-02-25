const net = require("net")

const breakLine = "\r\n"
const firstLine = [ "HTTP/1.1", 200, "OK" , breakLine ].join(" ")

const headers = [ 
  [ "Content-Type", "application/json" ].join(":") , breakLine 
].join(" ")

const server = net.createServer(socket => {
  

  socket.on('data', data => {

    const lines = data.toString().split(breakLine)
    const bodyDivider = lines.indexOf('')

    const [ requetLine, reqHeadersLines ] = lines.slice(0, bodyDivider)
    const bodyLines = lines.slice(bodyDivider + 1, lines.length)

    console.log(requetLine)
    console.log(reqHeadersLines)
    console.log(bodyLines)

    socket.write(firstLine)
    socket.write(headers)
  
    socket.write(breakLine)
  
    socket.write([ "hello http", breakLine ].join(" "))
    socket.end()
  })
})

server.listen(4000, '127.0.0.1')
