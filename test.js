const _ = require('lodash');
const upnp = require('nat-upnp').createClient();
const utils = require('./src/utils');
const args = require('optimist')('ports --tcp=27000,27500-28000 --udp=9999,10000-20000'.split(' ')).argv;


upnp.getMappings((err, mappings) => {
  console.log(mappings);
});

const ports = [
  {port: 80, protocol: 'TCP'},
  {port: 50000, protocol: 'UDP'}
];

const forwarded = [
  {port: 80, protocol: 'TCP'}
];

// const ports = [80, 50000];
// const forwarded = [80];

// utils.pushPorts(ports, [80, [90, 100]], 'TCP');
// utils.pushPorts(ports, [75, [73, 77]], 'UDP');

/*
upnp.getMappings((a, b, c) => {
  console.log(a, b, c);
});
*/
