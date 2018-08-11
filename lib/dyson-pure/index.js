const neeoapi = require('neeo-sdk');
const capabilities = require('./capabilities');
const controller = require('./controller');

const discoveryInstructions = {
  headerText: 'Discover devices',
  description: `NEEO will discover your Dyson devices now. 
                Currently these models are supported:
                - Dyson Pure Link Tower TP04 (2018)
                - Dyson Pure Link Desk DP04 (2018).

                NOTE: Ensure you have provided the device password (more information in README)
                
                Press NEXT to continue`
};

const dysonPureDriver = neeoapi
  .buildDevice('Pure Cool Link Devices')
  .setManufacturer('Dyson')
  .addAdditionalSearchToken('TP04') // Dyson Cool Pure Link Tower (2018)
  .addAdditionalSearchToken('DP04') // Dyson Cool Pure Link Desk (2018)
  // currently only 'sonos' is provided
  // https://github.com/NEEOInc/neeo-sdk/blob/master/lib/device/validation/icon.js
  // .setIcon('dyson')
  .setType('ACCESSOIRE')
  .enableDiscovery(discoveryInstructions, controller.discover)
  .registerInitialiseFunction(() => controller.initialize())
  .registerDeviceSubscriptionHandler(controller.deviceSubscriptionCallback);

addCapabilities(dysonPureDriver);

module.exports = [dysonPureDriver];

function addCapabilities(device) {
  capabilities.buttons.forEach(button => {
    device.addButton(button);
  });

  device.addButtonHandler((name, deviceId) => controller.onButtonPressed(name, deviceId));
}
