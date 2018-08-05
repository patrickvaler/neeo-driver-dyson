const neeoapi = require('neeo-sdk');

const dysonTp04Driver = neeoapi.buildDevice('Dyson Pure Cool TP04');

module.exports = {
  devices: [dysonTp04Driver]
};
