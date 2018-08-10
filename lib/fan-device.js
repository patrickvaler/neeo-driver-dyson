const debug = require('debug')('neeo-driver:dyson-tp04:fan.model');
const EventEmitter = require('events');
const mqtt = require('mqtt');

const { getFanDeviceConfigByModel } = require('./fan-device.config');

const DysonSwitch = Object.freeze({
  ON: 'ON',
  OFF: 'OFF'
});

module.exports = class FanDevice extends EventEmitter {
  static build(ip, serial, password, reachable, model) {
    return new FanDevice(ip, serial, password, reachable, model);
  }

  constructor(ip, serial, password, reachable, model) {
    super();
    this._config = getFanDeviceConfigByModel(model);
    this.id = serial;
    this.ip = ip;
    // TODO check if we could get rid of this field
    this.name = this._config.displayName;
    this.password = password;
    this.model = model;
    this.reachable = reachable;

    this._commandTopic = `${this.model}/${this.id}/command`;
    this._connected = false;
    this._fanState = {
      fpwr: null
    };
    this._mqttClient;
    this._statusSubscriptionTopic = `${this.model}/${this.id}/status/current`;
  }

  /**
   * PUBLIC API
   */

  connect() {
    if (!this._connected) {
      const options = {
        username: this.id,
        password: this.password,
        protocolVersion: this._config.mqttOptions.protocolVersion,
        protocolId: this._config.mqttOptions.protocolId
      };

      this._mqttClient = mqtt.connect(
        `mqtt://${this.ip}`,
        options
      );

      this._mqttClient.on('connect', () => {
        this._connected = true;
        this._mqttClient.subscribe(this._statusSubscriptionTopic);

        debug(`connected to ${this.id}`);
      });
      this._mqttClient.on('error', () => {
        this._connected = false;
        debug(`connection error on ${this.id}`);
      });
      this._mqttClient.on('message', (_topic, message) => this._messageHandler(message));
    }
  }

  /**
   * Sets power state
   * @param {boolean} value
   */
  setPowerState(value) {
    if (this.getPowerState() !== value) {
      this._publishState({ fpwr: value ? DysonSwitch.ON : DysonSwitch.OFF });
    }
  }

  /**
   * Returns power state
   * @return {boolean} power state
   */
  getPowerState() {
    return this._fanState.fpwr;
  }

  /**
   * PRIVATE API
   */
  _messageHandler(message) {
    const result = JSON.parse(message.toString());
    const state = result['product-state'];

    switch (result.msg) {
      case 'STATE-CHANGE':
        this._fanState = this._transformStateChange(state);
        break;
    }
  }

  _publishState(stateUpdate) {
    let currentTime = new Date();
    let message = { msg: 'STATE-SET', time: currentTime.toISOString(), data: stateUpdate };
    debug(`${this.name} - STATE-SET: ${JSON.stringify(message)}`);
    this._mqttClient.publish(this._commandTopic, JSON.stringify(message));
  }

  _transformStateChange(state) {
    const updateIndex = 1;

    return {
      fpwr: state.fpwr[updateIndex] === DysonSwitch.ON
    };
  }
};
