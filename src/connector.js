const Promise = require('bluebird');
const dgram = require('dgram');
const upnp = require('nat-upnp').createClient();
const utils = require('./utils');

class UserNet {
  constructor() {
    this.peers = [];
  }

  add(peerInfo) {
    this.peers.push(peerInfo);
  }
}

const socket = dgram.createSocket('udp4');
const me = {};
const userNet = new UserNet();

socket.on('error', err => {
  console.log(`[connector] error ${err}`);
});

socket.on('close', () => {
  console.log(`[connector] close`);
});

socket.on('listening', () => {
  console.log(`[connector] listening ${socket.address().address}:${socket.address().port}`);

  me.port = socket.address().port;
});

socket.on('message', (msg, rinfo) => {
  const pkg = JSON.parse(msg.toString());

  console.log(`[connector] message [${rinfo.address}:${rinfo.port}] {opCode: ${pkg.opCode}}`);

  switch (pkg.opCode) {
    case 'new-sucker':
      const isMe = me.address === pkg.data.endpoint.address && me.port === pkg.data.endpoint.port;

      console.log(`[connector] new-sucker {endpoint: ${JSON.stringify(pkg.data.endpoint)}, brothelAddress: ${pkg.data.brothelAddress}} {isMe: ${isMe}}`);

      if (isMe) {

      } else {
        userNet.add(pkg.data);
      }
      break;
  }
});

const peers = [];

let server;

function create() {
  socket.bind();

  return Promise.props({
    ip: utils.getNetworkIP()
  }).then(({ip}) => {
    me.address = ip;

    return {
      addPeer(address, port = 27000) {
        peers.push({address, port});
      },
      update() {
        socket.send(JSON.stringify({
          opCode: 'register',
          data: {
            myName: ip,
            endpoint: {
              port: socket.address().port,
              address: ip
            }
          }
        }), peers[0].port, peers[0].address, (err, n) => {
          // console.log(err, n);
        });
      },
      forwardPorts(ports) {

      }
    };
  });

}

module.exports = {
  create
};
