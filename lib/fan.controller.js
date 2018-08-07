const debug = require('debug')('neeo-driver:dyson-tp04:controller');

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
    debug('deviceAdded', deviceId);
    // TODO connect to device
  },
  deviceRemoved: deviceId => {
    debug('deviceRemoved', deviceId);
    // TODO unconnect
  },
  initializeDeviceList: deviceIds => {
    debug('initializeDeviceList', deviceIds);
  }
};

function onButtonPressed(name, deviceId) {
  debug(`${name} button pressed for device ${deviceId}`);
}

module.exports = {
  initialize,
  discover,
  deviceSubscriptionCallback,
  onButtonPressed
};
