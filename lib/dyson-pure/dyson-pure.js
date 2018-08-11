const debug = require('debug')('neeo-driver-dyson:fan-device');
const EventEmitter = require('events');
const mqtt = require('mqtt');

const { getDysonPureConfigByModel } = require('./dyson-pure.config');

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
    this._config = getDysonPureConfigByModel(model);
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

      debug(`[${this.id}] try to connect to ${this.ip}`);

      this._mqttClient = mqtt.connect(
        `mqtt://${this.ip}`,
        options
      );

      this._mqttClient.on('connect', () => {
        this._connected = true;
        this._mqttClient.subscribe(this._statusSubscriptionTopic);

        debug(`[${this.id}] connected to ${this.ip}`);
      });
      this._mqttClient.on('error', () => {
        this._connected = false;
        debug(`[${this.id}] connection error on ${this.ip}`);
      });
      this._mqttClient.on('message', (_topic, message) => this._messageHandler(message));
    }
  }

  /**
   * Sets power state
   * @param {boolean} value
   */

  powerOn() {
    this.setPowerState(true);
  }

  powerOff() {
    this.setPowerState(false);
  }

  setPowerState(value) {
    if (this.getPowerState() !== value) {
      this._publishState({ fpwr: value ? DysonSwitch.ON : DysonSwitch.OFF });
    }
  }

  /**
   * Returns power state
   * @return {boolean} power
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
        debug(`[${this.id}] State changed:  ${JSON.stringify(this._fanState)}`);
        break;
    }
  }

  _publishState(stateUpdate) {
    let currentTime = new Date();
    let message = { msg: 'STATE-SET', time: currentTime.toISOString(), data: stateUpdate };
    debug(`[${this.id}] Publish state update: ${JSON.stringify(message)}`);
    this._mqttClient.publish(this._commandTopic, JSON.stringify(message));
  }

  _transformStateChange(state) {
    const updateIndex = 1;

    return {
      fpwr: state.fpwr[updateIndex] === DysonSwitch.ON
    };
  }
};
