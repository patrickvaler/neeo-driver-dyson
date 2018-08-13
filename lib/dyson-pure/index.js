const neeoapi = require('neeo-sdk');
const controller = require('./controller');
const deviceConfig = require('./device-config');
const { Switches } = require('./capabilities');

const devices = [];

deviceConfig.getAll().forEach(config => {
  const device = neeoapi
    .buildDevice(config.name)
    .setManufacturer(config.manufacturer)
    .setType('ACCESSOIRE')
    .enableDiscovery(
      {
        headerText: 'Discover Devices',
        description: `NEEO will discover your ${config.displayName} ${
          config.key ? `(${config.key})` : ''
        } devices now. Press NEXT to continue`
      },
      controller.discover.bind(null, config.modelNumber)
    )
    .addPowerStateSensor(controller.switchCallbacks[Switches.POWER_SWITCH])
    .registerInitialiseFunction(() => controller.initialize())
    .registerDeviceSubscriptionHandler(controller.deviceSubscriptionCallback)
    .registerSubscriptionFunction((...args) => controller.registerSubscriptionFunction(...args));

  config.controls.buttons.forEach(button => {
    device.addButton(button);
  });

  config.controls.switches.forEach(s => {
    device.addSwitch(s, controller.switchCallbacks[s.name]);
  });

  config.searchTokens.forEach(token => {
    device.addAdditionalSearchToken(token);
  });

  device.addButtonHandler((name, deviceId) => controller.onButtonPressed(name, deviceId));
  devices.push(device);
});

module.exports = devices;
