const _ = require('lodash');
const binder = require('./src/binder');

const binderPort = 27000;

binder.run().then(api => {
  const peersArgument = process.argv.find(arg => arg.startsWith('--peers'));

  if (peersArgument) {
    const peers = peersArgument.substring('--peers='.length).split(',');

    if (peers.length) {
      peers.forEach(peer => {
        api.addPeer(peer, 27000);
      });

      api.update();
    }
  }
});

if (_.includes(process.argv, '-o')) {

}
