const _ = require('lodash');
const dgram = require('dgram');
const upnp = require('nat-upnp').createClient();
const utils = require('./src/utils');
const args = require('optimist')('ports --tcp=27000,27500-28000 --udp=9999,10000-20000'.split(' ')).argv;
/*
const soft = dgram.createSocket('udp4');
const externalProxy = dgram.createSocket('udp4');
const localProxy = dgram.createSocket('udp4');

soft.bind(50000, '0.0.0.0');
externalProxy.bind(40000, '0.0.0.0');
localProxy.bind(50001, '127.0.0.2');

soft.on('message', (msg, rinfo) => {
  console.log(rinfo);
});

localProxy.on('message', (msg, rinfo) => {
  // console.log(rinfo);

  localProxy.send('', 50000, '127.0.0.1');
});
// externalProxy.send('', 50001, '127.0.0.2');
externalProxy.send('', 50000, '127.0.0.1');
*/

utils.connector.getFreePort().then(port => {
  console.log(port);
});

/**
 * i want to connect 127.0.0.2:27015
 * i must to connect 5.5.5.5:NAT
 *
 */


/*
upnp.getMappings((err, mappings) => {
  mappings.forEach(mapping => {
    upnp.portUnmapping({
      public: mapping.public.port,
      protocol: mapping.protocol
    })
  });
});

const ports = [
  {port: 80, protocol: 'TCP'},
  {port: 50000, protocol: 'UDP'}
];

const forwarded = [
  {port: 80, protocol: 'TCP'}
];*/

// const ports = [80, 50000];
// const forwarded = [80];

// utils.pushPorts(ports, [80, [90, 100]], 'TCP');
// utils.pushPorts(ports, [75, [73, 77]], 'UDP');

/*
upnp.getMappings((a, b, c) => {
  console.log(a, b, c);
});
*/
