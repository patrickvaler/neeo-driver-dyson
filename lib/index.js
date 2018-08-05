const neeoapi = require('neeo-sdk');
const capabilities = require('./capabilities');
const { FanController } = require('./fan.controller');

const fanController = FanController.build();
const dysonTp04Driver = neeoapi
  .buildDevice('Pure Cool TP04')
  .setManufacturer('Dyson')
  // currently only 'sonos' is provided
  // https://github.com/NEEOInc/neeo-sdk/blob/master/lib/device/validation/icon.js
  // .setIcon('dyson')
  .setType('ACCESSOIRE')
  .registerInitialiseFunction(() => fanController.initialize());

addCapabilities(dysonTp04Driver);

module.exports = {
  devices: [dysonTp04Driver]
};

function addCapabilities(device) {
  capabilities.buttons.forEach(button => {
    device.addButton(button);
  });

  device.addButtonHandler((name, deviceId) => fanController.onButtonPressed(name, deviceId));
}
