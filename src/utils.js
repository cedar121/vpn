const http = require('http');
const qs = require('qs');
const axios = require('axios');
const natUpnp = require('nat-upnp');

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

function getNetworkIP() {
  return new Promise((resolve, reject) => {
    http.get({host: 'api.ipify.org', port: 80, path: '/'}, resp => {
      resp.on('data', ip => {
        resolve(ip.toString());
      });
    });
  });
}

module.exports = {
  getNetworkIP,
  checkTcpIsOpened
};
