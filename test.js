const upnp = require('nat-upnp').createClient();

const args = require('optimist')('ports --tcp=27000,27500-28000 --udp=9999,10000-20000'.split(' ')).argv;
console.log(args);
/*
upnp.getMappings((a, b, c) => {
  console.log(a, b, c);
});
*/
