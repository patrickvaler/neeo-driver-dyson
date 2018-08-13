const debug = require('debug')('neeo-driver-dyson:fan-device');
const EventEmitter = require('events');
const mqtt = require('mqtt');

const DysonSwitch = Object.freeze({
  ON: 'ON',
  OFF: 'OFF'
});

module.exports = class DysonPure extends EventEmitter {
  static build(ip, serial, password, reachable, config) {
    return new DysonPure(ip, serial, password, reachable, config);
  }

  constructor(ip, serial, password, reachable, config) {
    super();
    this._config = config;

    this.ip = ip;
    this.serial = serial;
    this.password = password;
    this.reachable = reachable;

    this._connected = false;
    this._state = {
      fpwr: null
    };
    this._mqttClient;
  }

  get modelNumber() {
    return this._config.modelNumber;
  }

  get name() {
    return this._config.displayName;
  }

  get _commandTopic() {
    return `${this.modelNumber}/${this.serial}/command`;
  }

  get _statusSubscriptionTopic() {
    return `${this.modelNumber}/${this.serial}/status/current`;
  }

  /**
   * PUBLIC API
   */

  connect() {
    if (!this._connected) {
      const options = {
        username: this.serial,
        password: this.password,
        protocolVersion: this._config.mqtt.protocolVersion,
        protocolId: this._config.mqtt.protocolId
      };

      debug(`[${this.serial}] try to connect to ${this.ip} - ${JSON.stringify(options)}`);

      this._mqttClient = mqtt.connect(
        `mqtt://${this.ip}`,
        options
      );

      this._mqttClient.on('connect', () => {
        debug(`[${this.serial}] connected to ${this.ip}`);
        this._connected = true;
        this._mqttClient.subscribe(this._statusSubscriptionTopic);
        this._requestCurrentState();
      });
      this._mqttClient.on('error', err => {
        this._connected = false;
        debug(`[${this.serial}] connection error on ${this.ip}: ${JSON.stringify(this._config.mqtt)}`);
        debug(err);
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
    return this._state.fpwr;
  }

  /**
   * PRIVATE API
   */
  _messageHandler(message) {
    const result = JSON.parse(message.toString());
    const state = result['product-state'];

    switch (result.msg) {
      case 'CURRENT-STATE':
        this._setFanState(this._tranformDysonResponse(state));
        debug(`[${this.serial}] State Message received:  ${result.msg}`, state);

        break;
      case 'STATE-CHANGE':
        this._setFanState(this._transformStateChange(state));
        debug(`[${this.serial}] State changed:  ${JSON.stringify(state)}`);
        break;
    }
  }

  _setFanState(state) {
    this._state = state;
    this.emit('state-changed');
  }

  _publishState(stateUpdate) {
    let currentTime = new Date();
    let message = { msg: 'STATE-SET', time: currentTime.toISOString(), data: stateUpdate };
    debug(`[${this.serial}] Publish state update: ${JSON.stringify(message)}`);
    this._mqttClient.publish(this._commandTopic, JSON.stringify(message));
    this._requestCurrentState();
  }

  _requestCurrentState() {
    debug(`[${this.serial}] Request for current state`);

    this._mqttClient.publish(
      `${this._commandTopic}`,
      JSON.stringify({
        msg: 'REQUEST-STATE-CHANGE',
        time: new Date().toISOString()
      })
    );
  }

  _tranformDysonResponse(state) {
    return {
      fpwr: state.fpwr === DysonSwitch.ON
    };
  }

  _transformStateChange(state) {
    const transformed = {};

    Object.keys(state).forEach(key => {
      transformed[key] = state[key][1];
    });

    return this._tranformDysonResponse(transformed);
  }
};
