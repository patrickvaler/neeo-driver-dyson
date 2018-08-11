const bonjour = require('bonjour')();
const debug = require('debug')('neeo-driver-dyson:dyson-device.state');

const { supportedDysonPureModels } = require('./dyson-pure/dyson-pure.config');
const DysonPure = require('./dyson-pure/dyson-pure');

class DysonDeviceState {
  static build() {
    return new DysonDeviceState();
  }

  constructor() {
    this._state = new Map();

    this._networkDevices = bonjour.find({ type: 'dyson_mqtt' });

    this._networkDevices.on('up', service => {
      const [productType, serial] = service.name.split('_');
      // TODO remove this and get it from config
      const password = process.env.DYSON_FAN_PASSWORD;
      const ip = service.addresses[0];
      debug(`[${serial}] network device found on ${ip}`);
      this._setDevice(ip, serial, password, true, productType);
    });
  }

  /**
   * PUBLIC API
   */

  getAllDevices() {
    return Array.from(this._state.values());
  }

  getDevice(deviceId) {
    return this._state.get(deviceId);
  }

  /**
   * PRIVATE API
   */

  _hasDevice(deviceId) {
    return this._state.has(deviceId);
  }

  _setDevice(ip, deviceId, password, reachable, model) {
    if (this._hasDevice(deviceId)) {
      debug(`Device '${deviceId} already exists in device state`);
      return;
    }

    let device;

    if (supportedDysonPureModels.includes(model)) {
      password = process.env.DYSON_FAN_PASSWORD;
      device = DysonPure.build(ip, deviceId, password, reachable, model);
    } else {
      debug(`Product model '${model}' is not supported`);
      return;
    }

    this._state.set(deviceId, device);
  }
}

// export as singleton because it can be used for all
// dyson devices like cooler, heater, vacuum robot
const dysonDeviceState = DysonDeviceState.build();

module.exports = {
  dysonDeviceState
};
