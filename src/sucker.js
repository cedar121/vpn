const net = require('net');

/**
 * (софт[...portN] <-> локальные прокси[...portN])
 */

let socket;

function suck(address, port) {
  // Внешнее соединение
  const sucker = dgram.createSocket('udp4');
  const suckerProxies = [];
  const punched = [];

  let p = [];

  const msg = new Buffer(JSON.stringify({
    opcode: 1
  }));

  sucker.send(msg, 0, msg.length, port, address, (err, bytes) => {

  });

  sucker.on('message', (msg, rinfo) => {
    const pkg = JSON.parse(msg.toString());

    switch (pkg.opcode) {
      // Обновление статуса сети
      case 2:
        console.log('обновление статуса сети');

        p = pkg.data.suckers;

        p.forEach(s => {
          if (s.address !== '127.0.0.1') {

          }
        });
        break;
    }

    console.log(`пришёл пакет от ${rinfo.address}:${rinfo.port}`);
  });

  return new Promise((resolve, reject) => {
    resolve({
      punch(ports) {
        ports.forEach(port => {
          if (punched.indexOf(port) === -1) {
            punched.push(port);
          }
        });
      }
    });
  });

  /*
  sucker.send(message, 0, message.length, serverPort, serverHost, function (err, nrOfBytesSent) {
    if (err) return console.log(err);

    console.log('UDP message sent to ' + serverHost +':'+ serverPort);
    // socket.close();
  });
  */
}

module.exports = {
  suck
};