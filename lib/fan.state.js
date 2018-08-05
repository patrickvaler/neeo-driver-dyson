const debug = require('debug')('neeo-driver:dyson-tp04:state');

class FanState {
  static build() {
    return new FanState();
  }
  constructor() {
    debug('initialized');
  }
}

module.exports = {
  FanState
};
