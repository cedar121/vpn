const net = require('net');
const utils = require('./utils');

const mappings = [];
const peers = [];
const enstablishes = [];
const connections = [];

const server = net.createServer(socket => {
  console.log(`[binder] ${socket.remoteAddress}:${socket.remotePort} connected`);

  connections.push({
    remote: {
      address: socket.remoteAddress,
      port: socket.remotePort
    },
    socket
  });

  socket.on('data', data => {
    const pkg = JSON.parse(data.toString());

    console.log(`[I][${socket.remoteAddress}:${socket.remotePort}][${pkg.opcode}]`);

    switch (pkg.opcode) {
      case 'establish':
        const {myName, networkName, address} = pkg.data;

        mappings.push({
          remote: {
            address: address ? address : socket.remoteAddress,
            port: socket.remotePort
          },
          name: myName
        });
        break;
    }
  });
});

server.on('listening', async () => {
  console.log(`[binder] event.listening ${server.address().address}:${server.address().port}`);

  const ip = await utils.getNetworkIP();
  const isOpened = await utils.checkTcpIsOpened(27000);
});

server.on('error', err => {
  console.log(`[binder] event.error ${err}`);
});

const me = {};

function findConnection(address, port) {
  return connections.find(connection => connection.remote.address === address && connection.remote.port === port);
}

function establish(address, port) {
  const connection = findConnection(address, port);

  connection.socket.write(JSON.stringify({
    opcode: 'establish',
    data: {
      address: me.ip,
      myName: me.ip
    }
  }));
}

function run(options = {}) {
  return new Promise((resolve, reject) => {
    utils.getNetworkIP().then(ip => {
      me.ip = ip;

      server.listen(27000, '0.0.0.0');

      resolve({
        addPeer(address, port) {
          peers.push({address, port});
        },
        update() {
          peers.filter(peer => {
            return true;
          }).forEach(peer => {
            establish(peer.address, peer.port);
          });
        }
      });
    });
  });
}

module.exports = {
  run
};
