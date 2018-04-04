const net = require('net');
const utils = require('./utils');

const mappings = [];
const peers = [];
const enstablishes = [];
const connections = [];
const me = {};

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

  me.ip = await utils.getNetworkIP();
});

server.on('error', err => {
  console.log(`[binder] event.error ${err}`);
});

function findConnection(address, port) {
  return connections.find(connection => connection.remote.address === address && connection.remote.port === port);
}

function establish(address, port) {
  console.log(`[binder] establish with ${address}:${port}`);

  let connection = findConnection(address, port);

  if (!connection) {
    console.log(`[binder] can't find connection`);

    connection = net.connect(port, address, connection => {
      console.log(`connecting...`);

      _establish(connection);
    });
  } else {
    _establish(connection);
  }

  function _establish(connection) {
    connection.socket.write(JSON.stringify({
      opcode: 'establish',
      data: {
        address: me.ip,
        myName: me.ip
      }
    }));
  }
}

function run(options = {}) {
  return new Promise(async (resolve, reject) => {
    const promises = [];

    server.on('listening', () => {
      if (!options.ignoreTunnelingActions) {
        promises.push(utils.checkTcpIsOpened(27000));
      }
    });

    await Promise.all(promises);

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
}

module.exports = {
  run
};
