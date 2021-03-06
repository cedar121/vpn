const Promise = require('bluebird');
const _ = require('lodash');
const dgram = require('dgram');
const timers = require('timers');
const utils = require('./utils');

const logger = utils.logger;

const server = dgram.createSocket('udp4');

const peers = [];
const ports = [];

// const pingPongTimer = setInterval(broadcastForward, 30000);

function broadcastForward() {
  console.log(`[binder] broadcast-forward`);

  peers.forEach(peer => {
    const needsToForward = _.differenceWith(ports, peer.forwarded, (a, b) => a.port === b.port && a.protocol === b.protocol);
    const alreadyForwarded = _.intersectionWith(ports, peer.forwarded, (a, b) => a.port === b.port && a.protocol === b.protocol);

    if (needsToForward.length) {
      console.log(`[binder] sending need-forward ${peer.endpoint.address}:${peer.endpoint.port}`);
      console.log(_.chain(needsToForward).groupBy('protocol').map((p, key) => {
        return `${key} ${p.map(pp => pp.port).join(',')}`
      }).join('; ').value());

      server.send(JSON.stringify({
        opCode: 'need-forward',
        data: {
          ports: needsToForward
        }
      }), peer.endpoint.port, peer.endpoint.address);
    } else {
      console.log(ports, peer.forwarded);

      console.log(`[binder] NOT sending need-forward ${peer.endpoint.address}:${peer.endpoint.port}`);
    }
  });
}

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

  console.log(`[binder] message ${rinfo.address}:${rinfo.port} {opCode: ${pkg.opCode}}`);

  switch (pkg.opCode) {
    case 'register':
      let bid = 2;

      while (peers.findIndex(peer => peer.brothelAddress === `127.0.0.${bid}`) !== -1) {
        bid++;
      }

      const peerInfo = {
        name: pkg.data.myName,
        endpoint: pkg.data.endpoint,
        brothelAddress: `127.0.0.${bid}`,
        forwarded: [],
        state: {
          forwardedPortsChecked: false
        }
      };

      peers.push(peerInfo);

      sendNewSucker(peerInfo);
      broadcastForward();
      break;
    case 'forward-result':
      utils.logger.debug(`[binder][got forwarded ports] ${utils.log.ports(pkg.data.ports)}`);

      const peer = findPeerByEndPoint(rinfo.address, rinfo.port);

      peer.forwarded = pkg.data.ports;

      checkForwardedPorts(peer);
      break;
  }
});

function findPeerByEndPoint(address, port) {
  return peers.find(peer => peer.endpoint.address === address && peer.endpoint.port === port);
}

function checkForwardedPorts(peer) {
  logger.debug(`[binder][checking forwarded ports]{peer: ${peer.endpoint.address}}`);

  peer.forwarded.forEach(port => {
    server.send(JSON.stringify({
      opCode: 'check-forwarded-port'
    }), port.public, peer.endpoint.address);
  });
}

function sendNewSucker(peerInfo) {
  peers.forEach(peer => {
    console.log(`[binder] sending new sucker to {name: ${peer.name}, endpoint: ${peer.endpoint.address}:${peer.endpoint.port}}`);

    server.send(JSON.stringify({
      opCode: 'new-sucker',
      data: peerInfo
    }), peer.endpoint.port, peer.endpoint.address);
  });
}

function run() {
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      resolve({
        sendOrderForPortForward(_ports) {
          console.log(`[binder] pushing new ports`);

          utils.pushPorts(ports, _ports.tcp || [], 'TCP');
          utils.pushPorts(ports, _ports.udp || [], 'UDP');

          broadcastForward();
        }
      });
    });

    server.on('listening', () => {

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
