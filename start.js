const Promise = require('bluebird');
const _ = require('lodash');
const binder = require('./src/binder');
const connectorFactory = require('./src/connector');

const binderPort = 27000;

const options = {};

options.ignoreTunnelingActions = process.argv.find(arg => arg === '--ignoreTunneling');

const promises = {};

if (!options.ignoreTunnelingActions) {
  promises['binder'] = binder.run();
}

promises['connector'] = connectorFactory.create();

/// region parsing peers argument
const peers = [];
const peersArgument = process.argv.find(arg => arg.startsWith('--peers'));

if (peersArgument) {
  peersArgument.substring('--peers='.length).split(',').forEach(peer => peers.push(peer));
}
/// endregion

Promise.props(promises).then(({api, connector}) => {
  connector.addPeer(peers[0]);
  connector.update();
});


/*
binder.run(options).then(api => {

});

if (_.includes(process.argv, '-o')) {

}
*/