const debug = require('debug')('neeo-driver:dyson-tp04:controller');

const { FanService } = require('./fan.service');

class FanController {
  static build() {
    return new FanController();
  }
  constructor() {
    this.fanService;
    this.sendMessageToBrainFunction = param => {
      debug('NOT_INITIALISED_YET %o', param);
    };
  }

  initialize() {
    debug('initialize()', new FanService());
    this.fanService = FanService.build();
  }

  onButtonPressed(name, deviceId) {
    debug(`${name} button pressed for device ${deviceId}`);
  }
}

module.exports = {
  FanController
};
