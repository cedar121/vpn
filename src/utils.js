const http = require('http');
const _ = require('lodash');
const qs = require('qs');
const axios = require('axios');
const natUpnp = require('nat-upnp');
const utils = require('./../node_modules/find-process/lib/utils');

const upnp = natUpnp.createClient();

async function checkTcpIsOpened(port, options = {}) {
  options = Object.assign({
    tryToOpen: true
  }, options);

  const ip = await getNetworkIP();

  return new Promise((resolve, reject) => {
    upnp.getMappings({}, (err, results) => {
      const rule = results.find(result => {
        return result.protocol === 'tcp' && result.private.port === 27000;
      });

      if (!rule) {
        upnp.portMapping({
          private: 27000,
          public: 27000,
          protocol: 'tcp'
        }, err => {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        });
      } else {
        console.log(`port ${rule.private.port} already UPNPed`);

        resolve();
      }
    });
  });
}

async function getNetworkIP() {
  return new Promise((resolve, reject) => {
    http.get({host: 'api.ipify.org', port: 80, path: '/'}, resp => {
      resp.on('data', ip => {
        resolve(ip.toString());
      });
    });
  });
}

function usingPorts(ppid) {
  return new Promise((resolve, reject) => {
    utils.exec('netstat -ano', function (err, stdout, stderr) {
      // replace header
      let data = utils.stripLine(stdout.toString(), 4);
      let columns = utils.extractColumns(data, [0, 1, 2, 3, 4], 5).filter(column => {
        let pid, matches = String(column[1]).match(/:(\d+)$/);

        if (!matches) {
          return false;
        }

        switch (column[0]) {
          case 'TCP':
            // [type, state, pid] = ['TCP', column[3], column[4]];
            pid = column[4];
            break;
          case 'UDP':
            // [type, pid] = ['UDP', column[3]];
            pid = column[3];
            break;
        }

        if (pid == ppid) {
          return true;
        }
      }).map(cols => {
        let type, state, pid, port = parseInt(cols[1].substring(cols[1].indexOf(':') + 1));

        switch (cols[0]) {
          case 'TCP':
            [type, state, pid] = ['TCP', cols[3], cols[4]];
            break;
          case 'UDP':
            [type, pid] = ['UDP', cols[3]];
            break;
        }

        return {
          type, state, pid, port
        };
      });

      resolve(columns);
    });
  });
}

function pushPorts(arr, ports, protocol) {
  if (!Array.isArray(ports)) {
    ports = [ports];
  }

  ports.forEach(port => {
    let p = [];

    if (Array.isArray(port)) {
      p = _.range(port[0], parseInt(port[1]) + 1);
    } else {
      p = [port];
    }

    p.forEach(p => {
      if (arr.findIndex(pp => pp.port === p && pp.protocol === protocol) === -1) {
        arr.push({port: p, protocol});
      }
    });
  });
}

module.exports = {
  getNetworkIP,
  checkTcpIsOpened,
  usingPorts,
  pushPorts,
  log: {
    ports(ports) {
      if (!ports.length) {
        return '';
      }

      const chain = _.chain(ports);

      // port mapping format
      if (ports[0].public && ports[0].name && !ports.port) {
        return chain.groupBy('protocol').map((ports, protocol) => {
          return `${protocol} ` + ports.map(port => port.name + (port.name === port.public ? '' : `(${port.public})`)).join(',');
        }).join('; ').value();
      }

      return chain.groupBy('protocol').map((p, key) => {
        return `${key} ${p.map(pp => pp.port).join(',')}`
      }).join('; ').value()
    }
  },
  logger: require('tracer').colorConsole({
    format: '<{{title}}> {{message}}'
  }),
  connector: {
    /**
     * Какие порты из необходимых проброшены, а какие нет
     */
    checkPorts(needs) {
      return new Promise((resolve) => {
        const done = [];
        const doneUpnp = [];
        const none = [];

        upnp.getMappings((err, mappings) => {
          needs.forEach(port => {
            let idx;

            if ((idx = mappings.findIndex(mapping => mapping.private.port === port.port && mapping.protocol.toUpperCase() === port.protocol.toUpperCase())) !== -1) {
              done.push(port);
              doneUpnp.push(mappings[idx]);
            } else {
              none.push(port);
            }
          });

          resolve({done, doneUpnp, none});
        });
      });
    },
    getFreePort(ignore) {
      utils.
    }
  }
};
