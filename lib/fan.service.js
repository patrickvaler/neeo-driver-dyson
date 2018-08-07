const bonjour = require('bonjour')();
const neeoapi = require('neeo-sdk');

class FanService {
  static build() {
    return new FanService();
  }

  constructor() {
    this._deviceState = neeoapi.buildDeviceState();
    this._networkDevices = bonjour.find({ type: 'dyson_mqtt' });

    this._networkDevices.on('up', service => {
      const [productType, serial] = service.name.split('_');
      // TODO create device instance
      const device = {
        // TODO filter for TP04 productType
        productType,
        ip: service.addresses[0],
        // TODO create display name based on productType
        name: service.name,
        id: serial,
        reachable: true
      };

      this._deviceState.addDevice(serial, device);
    });
  }

  /**
   * PUBLIC API
   */

  getAllDevices() {
    return this._deviceState.getAllDevices().map(device => device.clientObject);
  }

  /**
   * PRIVATE API
   */
}

module.exports = {
  FanService
};
