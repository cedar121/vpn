const net = require('net');
const utils = require('./utils');

const server = net.createServer(socket => {
  console.log(`[binder] ${socket.remoteAddress}:${socket.remotePort} connected`);

  socket.on('data', data => {

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

const mappings = [];

function run(options = {}) {
  server.listen(27000, '0.0.0.0');

  return Promise.resolve({});
}

module.exports = {
  run
};
