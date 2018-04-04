const utils = require('./src/utils');
const argv = require('optimist').argv;

if (argv.pid) {
  utils.usingPorts(argv.pid).then(ports => {
    console.log(ports);
  });
}
