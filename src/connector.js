const Promise = require('bluebird');
const _ = require('lodash');
const dgram = require('dgram');
const upnp = require('nat-upnp').createClient();
const utils = require('./utils');
const log = require('tracer').colorConsole({
  format: '<{{title}}> {{message}}'
});

class UserNet {
  constructor() {
    this.peers = [];
  }

  add(peerInfo) {
    this.peers.push(peerInfo);
  }
}

const socket = dgram.createSocket('udp4');
// Пул сокетов для проброшенных портов
const socketPool = [];

const me = {};
const userNet = new UserNet();
const portForwarding = {
  need: [],
  already: []
};

/// region basic events
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
/// endregion

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
    case 'need-forward':
      const [ports] = [pkg.data.ports];

      portForwarding.need = ports;

      const p = [];

      log.debug(`stage1 ${utils.log.ports(ports)}`);

      new Promise(resolve => {
        upnp.getMappings((err, mappings) => {
          ports.forEach(port => {
            if (mappings.findIndex(mapping => mapping.private.port === port.port && mapping.protocol.toUpperCase() === port.protocol.toUpperCase()) !== -1) {
              // Порт уже проброшен
            } else {
              p.push(port);
            }
          });

          resolve(p);
        });
      }).then(ports => {
        log.debug(`stage2 ${utils.log.ports(ports)}`);

        const upnpMappingPromises = [];

        ports.forEach(port => {
          upnpMappingPromises.push(new Promise((resolve, reject) => {
            const socketExternal = dgram.createSocket('udp4');

            socketExternal.on('listening', () => {
              const privatePort = socketExternal.address().port;

              upnp.portMapping({public: port.port, private: privatePort, protocol: port.protocol, description: `${port.protocol}-${port.port}`}, err => {
                if (err) return reject(err);

                socketPool.push(socketExternal);

                socketExternal.on('message', (msg, rinfo) => {
                  log.debug(`[connector][external][${port.port}] <- [${rinfo.address}:${rinfo.port}]`);
                });

                resolve();
              });
            });

            socket.bind();
          }));
        });

        Promise.all(upnpMappingPromises).then(() => {
          utils.connector.checkPorts(portForwarding.need).then(({doneUpnp, done}) => {
            socket.send(JSON.stringify({
              opCode: 'forward-result',
              data: {
                ports: _.map(doneUpnp, (port, idx) => {
                  return {
                    name: done[idx].port,
                    protocol: done[idx].protocol,
                    public: port.public.port
                  }
                })
              }
            }), peers[0].port, peers[0].address, (err, n) => {
              // console.log(err, n);
            });
          });
        });
      });
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
