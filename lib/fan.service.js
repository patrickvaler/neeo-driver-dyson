const debug = require('debug')('neeo-driver:dyson-tp04:controller');
const { FanState } = require('./fan.state');

class FanService {
  static build() {
    return new FanService();
  }

  constructor() {
    this._state = FanState.build();
    debug('initialized');
  }
}

module.exports = {
  FanService
};
