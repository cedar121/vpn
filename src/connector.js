const Promise = require('bluebird');
const dgram = require('dgram');
const utils = require('./utils');

const socket = dgram.createSocket('udp4');

socket.on('error', err => {
  console.log(`[connector] error ${err}`);
});

socket.on('close', () => {
  console.log(`[connector] close`);
});

socket.on('listening', () => {
  console.log(`[connector] listening ${socket.address().address}:${socket.address().port}`);
});

const peers = [];

let server;

function create() {
  socket.bind();

  return Promise.props({
    ip: utils.getNetworkIP()
  }).then(({ip}) => {
    return {
      addPeer(address, port = 27000) {
        peers.push({address, port});
      },
      update() {
        socket.send(JSON.stringify({
          opcode: 'register',
          data: {
            endpoint: {
              port: socket.address().port,
              address: ip
            }
          }
        }), peers[0].port, peers[0].address, (err, n) => {
          console.log(err, n);
        });
      }
    };
  });

}

module.exports = {
  create
};
