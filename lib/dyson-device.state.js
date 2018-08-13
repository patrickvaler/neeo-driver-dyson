const debug = require('debug')('neeo-driver-dyson:dyson-device.state');

class DysonDeviceState {
  static build() {
    return new DysonDeviceState();
  }

  constructor() {
    this._state = new Map();
  }

  /**
   * PUBLIC API
   */

  addDevice(deviceId, device) {
    if (this._state.has(deviceId)) {
      debug(`[${deviceId}] device already exists in device state`);
      return;
    }

    this._state.set(deviceId, device);
    debug(`[${deviceId}] device added in device state`);
  }

  removeDevice(deviceId) {
    if (!this._state.has()) {
      debug(`remove dvice failed: '${deviceId}' does not exist in state`);
      return;
    }
    this._state.delete(deviceId);
  }

  getAllDevices() {
    return Array.from(this._state.values());
  }

  getDevicesByModelNumber(model) {
    return this.getAllDevices().filter(device => device.modelNumber === model);
  }

  getDevice(deviceId) {
    return this._state.get(deviceId);
  }

  hasDevice(deviceId) {
    return !!this.getDevice(deviceId);
  }
}

module.exports = DysonDeviceState;
