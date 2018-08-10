const debug = require('debug')('neeo-driver:dyson-tp04:controller');

const { Buttons } = require('./capabilities');
const { FanService } = require('./fan.service');

const fanService = FanService.build();

function initialize() {
  debug('initialize()');
}

function discover() {
  return fanService.getAllDevices();
}

const deviceSubscriptionCallback = {
  deviceAdded: deviceId => {
    fanService.connectDevice();
    debug('deviceAdded', deviceId);
  },
  deviceRemoved: deviceId => {
    debug('deviceRemoved', deviceId);
  },
  initializeDeviceList: deviceIds => {
    debug('initializeDeviceList', deviceIds);
    deviceIds.forEach(deviceId => fanService.connectDevice(deviceId));
  }
};

function onButtonPressed(name, deviceId) {
  debug(`${name} button pressed for device ${deviceId}`);

  switch (name) {
    case Buttons.POWER_ON:
      fanService.setPowerOn(deviceId);
      break;
    case Buttons.POWER_OFF:
      fanService.setPowerOff(deviceId);
      break;
    default:
      debug(`Unsupported Button '${name}'`);
      break;
  }
}

module.exports = {
  initialize,
  discover,
  deviceSubscriptionCallback,
  onButtonPressed
};
