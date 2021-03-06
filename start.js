const Promise = require('bluebird');
const _ = require('lodash');
const binder = require('./src/binder');
const connectorFactory = require('./src/connector');
const read = require('read');

const binderPort = 27000;

const options = {};

options.ignoreTunnelingActions = process.argv.find(arg => arg === '--ignoreTunneling');
options.onlyAsBinder = Boolean(process.argv.find(arg => arg === '--onlyAsBinder'));
options.disableBinder = Boolean(process.argv.find(arg => arg === '--disableBinder'));

const promises = {};

if (!options.disableBinder) {
  promises['binder'] = binder.run();
}

if (!options.onlyAsBinder) {
  promises['connector'] = connectorFactory.create();
}

/// region parsing peers argument
const peers = [];
const peersArgument = process.argv.find(arg => arg.startsWith('--peers'));

if (peersArgument) {
  peersArgument.substring('--peers='.length).split(',').forEach(peer => peers.push(peer));
}
/// endregion

Promise.props(promises).then(({binder, connector}) => {
  if (connector) {
    connector.addPeer(peers[0]);
    connector.update();

    connector.forwardPorts({
      'TCP': [[27020, 27039]],
      'UDP': [1200, [27000, 27015]]
    });
  }

  if (binder) {
    read({}, (err, str) => {
      if (err) {
        return;
        return console.log(err);
      }

      if (str.startsWith('ports')) {
        binder.sendOrderForPortForward(parsePortInput(str.substring(5)));
      }
    });

    binder.sendOrderForPortForward(parsePortInput(process.argv.slice(2).join(' ')));
  }
});

function parsePortInput(str) {
  // ports --tcp=27000,27500-28000 --udp=9999,10000-20000

  const args = require('optimist')(str.split(' ')).argv;
  const ports = {};

  if (args.tcp) {
    ports.tcp = String(args.tcp).split(',').map(p => {
      if (p.indexOf('-') !== -1) {
        return [parseInt(p.substring(0, p.indexOf('-'))), parseInt(p.substring(p.indexOf('-') + 1))];
      }

      return parseInt(p);
    });
  }

  if (args.udp) {
    ports.udp = String(args.udp).split(',').map(p => {
      if (p.indexOf('-') !== -1) {
        return [parseInt(p.substring(0, p.indexOf('-'))), parseInt(p.substring(p.indexOf('-') + 1))];
      }

      return parseInt(p);
    });
  }

  return ports;
}

/*
binder.run(options).then(api => {

});

if (_.includes(process.argv, '-o')) {

}
*/