const net = require('net');
const utils = require('./utils');

const mappings = [];

const server = net.createServer(socket => {
  console.log(`[binder] ${socket.remoteAddress}:${socket.remotePort} connected`);

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

function run(options = {}) {
  server.listen(27000, '0.0.0.0');

  return Promise.resolve({});
}

module.exports = {
  run
};
