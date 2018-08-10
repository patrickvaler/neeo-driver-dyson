const bonjour = require('bonjour')();
const neeoapi = require('neeo-sdk');

const { supportedFanDeviceModels } = require('./fan-device.config');
const FanDevice = require('./fan-device');

class FanService {
  static build() {
    return new FanService();
  }

  constructor() {
    this._deviceState = neeoapi.buildDeviceState();
    this._networkDevices = bonjour.find({ type: 'dyson_mqtt' });

    this._networkDevices.on('up', service => {
      const [productType, serial] = service.name.split('_');
      const isSupported = supportedFanDeviceModels.includes(productType);
      if (isSupported && !this._hasDevice(serial)) {
        // TODO remove this and get it from config
        const password = process.env.DYSON_FAN_PASSWORD;
        const device = FanDevice.build(service.addresses[0], serial, password, true, productType);

        this._deviceState.addDevice(serial, device);
      }
    });
  }

  /**
   * PUBLIC API
   */

  getAllDevices() {
    return this._deviceState.getAllDevices().map(device => device.clientObject);
  }

  getDevice(deviceId) {
    return this._deviceState.getClientObjectIfReachable(deviceId);
  }

  connectDevice(deviceId) {
    const device = this.getDevice(deviceId);
    if (device) {
      device.connect();
    }
  }

  setPowerOn(deviceId) {
    const device = this.getDevice(deviceId);
    device.setPowerState(true);
  }

  setPowerOff(deviceId) {
    const device = this.getDevice(deviceId);
    device.setPowerState(false);
  }

  /**
   * PRIVATE API
   */

  _hasDevice(deviceId) {
    let found = false;
    const devices = this.getAllDevices();

    for (let i = 0; i < devices.length; i++) {
      if (devices[i].id === deviceId) {
        found = true;
        break;
      }
    }

    return found;
  }
}

module.exports = {
  FanService
};
