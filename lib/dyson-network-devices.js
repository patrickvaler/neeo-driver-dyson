const bonjour = require('bonjour')();
const debug = require('debug')('neeo-driver-dyson:dyson-network-devices');

class DysonNetworkDevice {
  constructor(service) {
    const [productType, serial] = service.name.split('_');
    this.modelNumber = productType;
    this.serial = serial;
    this.ip = service.addresses[0];
  }
}

class DysonNetworkDevices {
  constructor() {
    this._networkDevices = new Map();
    this._deviceFinder;
  }

  connect() {
    this._deviceFinder = bonjour.find({ type: 'dyson_mqtt' });
    this._deviceFinder.on('up', service => this._addDevice(service));
  }

  getNetworkDevice(deviceId) {
    return this._networkDevices.get(deviceId);
  }

  getNetworkDevicesByModelNumber(modelNumber) {
    const devices = Array.from(this._networkDevices.values());

    return devices.filter(device => {
      return device.modelNumber == modelNumber;
    });
  }

  _addDevice(service) {
    const deviceId = service.name.split('_')[1];
    debug(`[${deviceId}] network device found on ${service.addresses[0]}`);

    if (!this._networkDevices.has(deviceId)) {
      this._networkDevices.set(deviceId, new DysonNetworkDevice(service));
      debug(`[${deviceId}] network device added`);
    }
  }
}

// export as singleton
const dysonNetworkDevices = new DysonNetworkDevices();
dysonNetworkDevices.connect();

module.exports = dysonNetworkDevices;
