const debug = require('debug')('neeo-driver-dyson:controller');

const { Buttons } = require('./capabilities');
const { dysonDeviceState } = require('../dyson-device.state');

function initialize() {
  debug('initialize()');
}

function discover() {
  const devices = dysonDeviceState.getAllDevices();
  debug(`discovered devices ${JSON.stringify(devices)}`);
  return devices;
}

const deviceSubscriptionCallback = {
  deviceAdded: deviceId => {
    _connectDevice(deviceId);
    debug(`[${deviceId}] device added`);
  },
  deviceRemoved: deviceId => {
    debug(`[${deviceId}] device removed`);
  },
  initializeDeviceList: deviceIds => {
    debug('initializeDeviceList', deviceIds);
    deviceIds.forEach(deviceId => _connectDevice(deviceId));
  }
};

function onButtonPressed(name, deviceId) {
  debug(`[${deviceId}] ${name} button pressed`);
  const device = dysonDeviceState.getDevice(deviceId);

  switch (name) {
    case Buttons.POWER_ON:
      device.powerOn();
      break;
    case Buttons.POWER_OFF:
      device.powerOff();
      break;
    default:
      debug(`Unsupported Button '${name}'`);
      break;
  }
}

function _connectDevice(deviceId) {
  const device = dysonDeviceState.getDevice(deviceId);

  if (device) {
    device.connect();
  }
}

module.exports = {
  initialize,
  discover,
  deviceSubscriptionCallback,
  onButtonPressed
};
