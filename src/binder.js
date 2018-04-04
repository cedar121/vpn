const Promise = require('bluebird');
const dgram = require('dgram');
const utils = require('./utils');

const server = dgram.createSocket('udp4');

server.on('listening', () => {
  console.log(`[binder] listening ${server.address().address}:${server.address().port}`);
});

server.on('close', () => {
  console.log(`[binder] close`);
});

server.on('error', err => {
  console.log(`[binder] error ${err}`);
});

server.on('message', (msg, rinfo) => {
  const pkg = JSON.parse(msg.toString());

  console.log(`[binder] message ${rinfo.address}:${rinfo.port} {opcode: ${pkg.opcode}}`);

  switch (pkg.opcode) {
    case 'register':

      break;
  }
});

function run() {
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      resolve();
    });

    server.bind(27000);
  });
}

/*
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
*/

module.exports = {
  run
};
