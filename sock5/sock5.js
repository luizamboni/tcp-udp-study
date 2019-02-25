// http://www.ietf.org/rfc/rfc1928.txt

// Tested with: curl http://www.google.se/ --socks5 localhost:1080 --proxy-user foo:bar
const net = require('net')


const States = {
  CONNECTED: 0,
  VERIFYING: 1,
  READY: 2,
  PROXY: 3
}

const AuthMethods = {
  NOAUTH: 0,
  GSSAPI: 1,
  USERPASS: 2
}

const CommandType = {
  TCPConnect: 1,
  TCPBind: 2,
  UDPBind: 3
}

const AddressTypes = {
  IPv4: 0x01,
  DomainName: 0x03,
  IPv6: 0x04,

  read: function(buffer, offset) {
    if(buffer[offset] == AddressTypes.IPv4) {
      return buffer[offset + 1] + "." +
             buffer[offset + 2] + "." +
             buffer[offset + 3] + "." +
             buffer[offset + 4]

    } else if(buffer[offset] == AddressTypes.DomainName){
      return buffer.toString('utf8',
        buffer[ offset + 2],
        buffer[ offset + 2 + buffer[offset+1] ]
      )
    } else if(buffer[offset] == AddressTypes.IPv6){
      return buffer.slice(buffer[offset+1], buffer[offset+1+16])
    }
  },

  sizeOf: function(buffer,offset){
    if(buffer[offset] == AddressTypes.IPv4) {
        return 4
      } else if(buffer[offset] == AddressTypes.DomainName) {
        return buffer[offset+1]
      } else if(buffer[offset] == AddressTypes.IPv6) {
        return 16
      }
   }
}

const connectedClients = []

function acceptConnection(socket) {

  connectedClients.push(socket) 
  socket.pstate = States.CONNECTED

  /**
   *  when end connection ends, remove
   *  this on list of connected clients
   */
  socket.on('end', () => {
    const i = connectedClients.indexOf(socket)
    console.log(`removed client number ${i}`)
    connectedClients.splice(i, 1)
  })

  const handshake = function(chunk) {

    socket.removeListener('data', handshake)
    //SOCKS Version
    if(chunk[0] != 5) {
      socket.end()
    }
    
    n = chunk[1] // Number of auth methods

    socket.methods = []
    for(i=0; i < n; i++) {
      socket.methods.push(chunk[1+i])
    }
    //console.log('AuthMethods: '+socket.methods);

    const resp = new Buffer(2)
    resp[0] = 0x05
    if (socket.methods.indexOf(AuthMethods.USERPASS)) {

      socket.authUSERPASS = authUSERPASS.bind(socket)
      socket.on('data', socket.authUSERPASS)

      socket.pstate = States.VERIFYING
      resp[1] = AuthMethods.USERPASS
      socket.write(resp)
    } else {
      resp[1] = 0xFF
      socket.end(resp)
    }
  }
  socket.on('data', handshake)
}

function authUSERPASS(chunk) {

  console.log("auth step")

  // this here is is socket
  this.removeListener('data', this.authUSERPASS)
  resp = new Buffer(2)
  resp[0] = 1 //Version
  resp[1] = 0xff

  if(chunk[0] != 1) {
    // Wrong auth version, closing connection.
    this.end(resp)
  } else {
    nameLength = chunk[1]
    username = chunk.toString('utf8', 2, 2 + nameLength)
  
    passLength = chunk[2+nameLength]
    password = chunk.toString('utf8', 3 + nameLength, 3 + nameLength + passLength)
    //console.log('Authorizing: '+username)
    
    if (authorize(username, password)) {
      this.pstate = States.READY
      this.handleRequest = handleRequest.bind(this)
      this.on('data', this.handleRequest)
      resp[1] = 0x00
      this.write(resp)
      //console.log('Accepted');
    } else {
  
      this.end(resp)
      //console.log('Denied');
    }
  }
}

/**
 * mock auth: always return true
 */ 
function authorize(username,password) {
 return true
}

function handleRequest(chunk) {
  console.log("handle request")
  // this here is is Socket
  this.removeListener('data', this.handleRequest)

  if(chunk[0] != 5) {
    chunk[1] = 0x01
    // Wrong version.
    this.end(chunk)

  } else {
    offset = 3
    const address = AddressTypes.read(chunk, offset)
    offset += AddressTypes.sizeOf(chunk, offset) + 1
  
    const port = chunk.readUInt16BE(offset)
    //console.log('Request', chunk[1], " to: "+ address+":"+port);
  
    if(chunk[1] == CommandType.TCPConnect) {
      this.request = chunk

      /**
       * net.createConnection(port[, host][, connectListener])
       * create a connection with destin (target)
       */
      this.proxy =  net.createConnection(port, address, initProxy.bind(this))
    } else {
      this.end(chunk)
    }
  }
}

function initProxy() {

  console.log("init proxy")
  const resp = new Buffer(this.request.length)
  // this is socket with clientthis
  this.request.copy(resp)
  resp[1] = 0x00

  this.write(resp)

  /**
   * here, every data is received on proxy is transmited to socket
   */
  this.proxy.on('data', function(data){
    this.write(data)
  }.bind(this))

  /**
   *  every data writed socket is transmited to proxy
   */
  this.on('data', function(data) {
    this.proxy.write(data)
  }.bind(this))
}

function dump(chunk) {
  console.log('dumping:')
  console.log(chunk.toString('utf8'))
}


const server = net.createServer(acceptConnection)

server.listen(1080, () => {
  console.log("start sock5")
})