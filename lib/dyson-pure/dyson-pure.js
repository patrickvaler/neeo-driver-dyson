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
      auto: null,
      fpwr: null,
      fnsp: 1,
      nmod: null
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

  /**
   * Connects to the dyson device and requests the current state
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

  autoOn() {
    this._setAutoState(true);
  }

  autoOff() {
    this._setAutoState(false);
  }

  isAuto() {
    return this._state.auto;
  }

  nightModeOn() {
    this._setNightModeState(true);
  }

  nightModeOff() {
    this._setNightModeState(false);
  }

  isNightMode() {
    return this._state.nmod;
  }

  powerOn() {
    this._setPowerState(true);
  }

  powerOff() {
    this._setPowerState(false);
  }

  isOn() {
    return this._state.fpwr;
  }

  speedUp() {
    this._setSpeedState(this._state.fnsp + 1);
  }

  speedDown() {
    this._setSpeedState(this._state.fnsp - 1);
  }

  /**
   * PRIVATE API
   */

  _messageHandler(message) {
    const result = JSON.parse(message.toString());
    const state = result['product-state'];

    switch (result.msg) {
      case 'CURRENT-STATE':
        this._updateFanState(this._tranformDysonResponse(state));
        debug(`[${this.serial}] State Message received:  ${result.msg}`, state);

        break;
      case 'STATE-CHANGE':
        this._updateFanState(this._transformStateChange(state));
        debug(`[${this.serial}] State changed:  ${JSON.stringify(state)}`);
        break;
    }
  }

  /**
   * Publishs auto state update if different than curren auto state
   * @param {boolean} value new auto state
   */
  _setAutoState(value) {
    if (this.isAuto() !== value) {
      this._publishState({ auto: value ? DysonSwitch.ON : DysonSwitch.OFF });
    }
  }

  /**
   * Publishs night mode state update if different than curren night mode state
   * @param {boolean} value new night mode state
   */
  _setNightModeState(value) {
    if (this.isNightMode() !== value) {
      this._publishState({ nmod: value ? DysonSwitch.ON : DysonSwitch.OFF });
    }
  }

  /**
   * Publishs power state update if different than curren power state
   * @param {boolean} value new power state
   */
  _setPowerState(value) {
    if (this.isOn() !== value) {
      this._publishState({ fpwr: value ? DysonSwitch.ON : DysonSwitch.OFF });
    }
  }

  /**
   * Publishs speed state if speed state is valid (1 - 10) or if fan is off or
   * in auto mode.
   *
   * @param {boolean} number new fan speed
   */
  _setSpeedState(value) {
    const updateable = value > 0 && value < 11 && value !== this._getSpeedState();

    if (updateable || !this.isOn() || this.isAuto()) {
      if (value < 1) {
        value = 1;
      } else if (value > 10) {
        value = 10;
      }

      let valueAsString = value.toString();
      let prefix = valueAsString.length > 1 ? '00' : '000';

      this._publishState({ fnsp: prefix + valueAsString });
    } else {
      debug(`Fan Speed is cannot be set to '${value}'`);
    }
  }

  _getSpeedState() {
    return this._state.fnsp;
  }

  /**
   * Publishs new state to dyson device. Power on and
   * auto off is set by default.
   *
   * @param {PartialDysonDeviceState} stateUpdate
   */
  _publishState(stateUpdate) {
    let currentTime = new Date();
    let message = {
      msg: 'STATE-SET',
      time: currentTime.toISOString(),
      data: Object.assign({ fpwr: DysonSwitch.ON, auto: DysonSwitch.OFF }, stateUpdate)
    };
    debug(`[${this.serial}] Publish state update: ${JSON.stringify(message)}`);
    this._mqttClient.publish(this._commandTopic, JSON.stringify(message));
  }

  /**
   * Requests the current state from dyson device
   */
  _requestCurrentState() {
    debug(`[${this.serial}] Request for current state`);

    this._mqttClient.publish(
      `${this._commandTopic}`,
      JSON.stringify({
        msg: 'REQUEST-CURRENT-STATE',
        time: new Date().toISOString()
      })
    );
  }

  /**
   * Transforms the dyson device state to the internal state
   *
   * @param {DeviceState} state
   */
  _tranformDysonResponse(state) {
    return {
      auto: state.auto === DysonSwitch.ON,
      fpwr: state.fpwr === DysonSwitch.ON,
      fnsp: state.fnsp === 'AUTO' ? this._getSpeedState() || 1 : parseInt(state.fnsp),
      nmod: state.nmod === DysonSwitch.ON
    };
  }

  /**
   * Transforms the dyson device "state-change" state to the
   * internal state
   *
   * @param {DeviceState} state
   */
  _transformStateChange(state) {
    const transformed = {};

    Object.keys(state).forEach(key => {
      transformed[key] = state[key][1];
    });

    return this._tranformDysonResponse(transformed);
  }

  /**
   * Sets internal device state and fires 'state-changed' event
   * @param {DeviceState} state
   */
  _updateFanState(state) {
    this._state = state;
    this.emit('state-changed');
  }
};
