const neeoapi = require('neeo-sdk');
const capabilities = require('./capabilities');
const fanController = require('./fan.controller');

const discoveryInstructions = {
  headerText: 'Discover devices',
  description: 'NEEO will discover your Dyson devices now, press NEXT'
};

const dysonTp04Driver = neeoapi
  .buildDevice('Pure Cool Link')
  .setManufacturer('Dyson')
  .addAdditionalSearchToken('TP04') // Dyson Cool Pure Link Tower (2018)
  .addAdditionalSearchToken('DP04') // Dyson Cool Pure Link Desk (2018)
  // currently only 'sonos' is provided
  // https://github.com/NEEOInc/neeo-sdk/blob/master/lib/device/validation/icon.js
  // .setIcon('dyson')
  .setType('ACCESSOIRE')
  .enableDiscovery(discoveryInstructions, fanController.discover)
  .registerInitialiseFunction(() => fanController.initialize())
  .registerDeviceSubscriptionHandler(fanController.deviceSubscriptionCallback);

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
