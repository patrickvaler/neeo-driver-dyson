const debug = require('debug')('neeo-driver-dyson:controller');

const { Buttons, Switches } = require('./capabilities');
const dysonDeviceState = require('../dyson-device.state').build();
const dysonNetworkDevices = require('../dyson-network-devices');
const DysonPure = require('./dyson-pure');
const deviceConfig = require('./device-config');

const _brainCallbacks = {
  sendUpdateToBrain: () => {
    debug('_sendUpdateToBrain() not initialized! ');
  },
  markDeviceOn: () => {
    debug('_markDeviceOn() not initialized! ');
  },
  markDeviceOff: () => {
    debug('markDevicOff() not initialized! ');
  }
};

function initialize() {
  debug('initialize()');
}

function discover(modelNumber) {
  const networkDevices = dysonNetworkDevices.getNetworkDevicesByModelNumber(modelNumber);
  debug(`discovered networkDevices ${JSON.stringify(networkDevices)} for modelNumber '${modelNumber}'`);
  return networkDevices.map(device => {
    return {
      id: device.serial,
      name: deviceConfig.getConfig(modelNumber).displayName
    };
  });
}

const deviceSubscriptionCallback = {
  deviceAdded: deviceId => {
    _initDevice(deviceId);
  },
  deviceRemoved: deviceId => {
    dysonDeviceState.removeDevice(deviceId);
    debug(`[${deviceId}] device removed`);
  },
  initializeDeviceList: deviceIds => {
    debug('initializeDeviceList', deviceIds);
    deviceIds.forEach(deviceId => _initDevice(deviceId));
  }
};

function onButtonPressed(name, deviceId) {
  const device = dysonDeviceState.getDevice(deviceId);
  debug(`[${deviceId}] ${name} button pressed`);

  switch (name) {
    case Buttons.AUTO_ON:
      device.autoOn();
      break;
    case Buttons.AUTO_OFF:
      device.autoOff();
      break;
    case Buttons.POWER_ON:
      device.powerOn();
      break;
    case Buttons.POWER_OFF:
      device.powerOff();
      break;
    case Buttons.SPEED_DOWN:
      device.speedDown();
      break;
    case Buttons.SPEED_UP:
      device.speedUp();
      break;
    default:
      debug(`Unsupported Button '${name}' - supported Buttons defined in ${__dirname + '/capabilites.js'}`);
      break;
  }
}

const autoSwitchCallback = {
  getter: deviceId => {
    const device = dysonDeviceState.getDevice(deviceId);
    return device.isAuto();
  },
  setter: (deviceId, value) => {
    const device = dysonDeviceState.getDevice(deviceId);
    if (value) {
      device.autoOn();
    } else {
      device.autoOff();
    }
  }
};

const powerSwitchCallback = {
  getter: deviceId => {
    const device = dysonDeviceState.getDevice(deviceId);
    return device.isOn();
  },
  setter: (deviceId, value) => {
    const device = dysonDeviceState.getDevice(deviceId);
    if (value) {
      device.powerOn();
    } else {
      device.powerOff();
    }
  }
};

const switchCallbacks = {
  [Switches.AUTO_SWITCH]: autoSwitchCallback,
  [Switches.POWER_SWITCH]: powerSwitchCallback
};

function registerSubscriptionFunction(updateCallback, optionalCallbackFunctions) {
  _brainCallbacks.sendUpdateToBrain = updateCallback;

  if (optionalCallbackFunctions && optionalCallbackFunctions.powerOnNotificationFunction) {
    _brainCallbacks.markDeviceOn = optionalCallbackFunctions.powerOnNotificationFunction;
  }
  if (optionalCallbackFunctions && optionalCallbackFunctions.powerOffNotificationFunction) {
    _brainCallbacks.markDeviceOff = optionalCallbackFunctions.powerOffNotificationFunction;
  }
}

function _sendPowerStateUpdateToBrain(deviceId, isOn) {
  if (isOn) {
    _brainCallbacks.markDeviceOn(deviceId);
  } else {
    _brainCallbacks.markDeviceOff(deviceId);
  }
}

function _sendStateUpdateToBrain(uniqueDeviceId, component, value) {
  _brainCallbacks.sendUpdateToBrain({ uniqueDeviceId, component, value }).catch(error => {
    debug('sendUpdateToBrain failed:', error.message);
  });
}

function _initDevice(deviceId) {
  const device = _createDevice(deviceId);

  if (device) {
    dysonDeviceState.addDevice(deviceId, device);
    device.on('state-changed', () => {
      // the SDK handles repeated messages, so just fire and forget
      _sendPowerStateUpdateToBrain(device.isOn());
      _sendStateUpdateToBrain(deviceId, Switches.POWER_SWITCH, device.isOn());
      _sendStateUpdateToBrain(deviceId, Switches.AUTO_SWITCH, device.isAuto());
    });
    device.connect();
  }
}

function _createDevice(deviceId) {
  const networkDevice = dysonNetworkDevices.getNetworkDevice(deviceId);

  if (!networkDevice) {
    debug(`Network device with id '${deviceId}' not found.`);
    return;
  }

  if (!deviceConfig.isModelNumberSupported(networkDevice.modelNumber)) {
    debug(`Product model '${networkDevice.modelNumber}' is not supported`, deviceConfig.getSupportedModels());
    return;
  }

  if (dysonDeviceState.hasDevice(deviceId)) {
    debug(`device '${deviceId}' already in state, no need to create new instance`);
    return;
  }

  // TODO remove this and get it from config
  const password = process.env.DYSON_FAN_PASSWORD;
  const config = deviceConfig.getConfig(networkDevice.modelNumber);

  return DysonPure.build(networkDevice.ip, deviceId, password, true, config);
}

module.exports = {
  deviceSubscriptionCallback,
  discover,
  initialize,
  onButtonPressed,
  registerSubscriptionFunction,
  switchCallbacks
};
