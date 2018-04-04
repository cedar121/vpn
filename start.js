const _ = require('lodash');
const binder = require('./src/binder');

const binderPort = 27000;

binder.run();

if (_.includes(process.argv, '-o')) {

}
