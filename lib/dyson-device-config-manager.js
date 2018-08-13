const debug = require('debug')('neeo-driver-dyson:dyson-device-config-manager');
const readYaml = require('read-yaml');
const controlsConfig = require('./controls-config');

class DysonDeviceConfigManager {
  static build(configPaths) {
    return new DysonDeviceConfigManager(configPaths);
  }

  constructor(configPaths) {
    this.configPaths = configPaths;
    this._controlsConfig = controlsConfig;
    this._configMap = new Map();

    this._initializeConfigs();
  }

  getAll() {
    return Array.from(this._configMap.values());
  }

  getConfig(modelNumber) {
    return this._configMap.get(modelNumber);
  }

  isModelNumberSupported(modelNumber) {
    return this._getSupportedModels().includes(modelNumber);
  }

  _getSupportedModels() {
    return this.getAll().map(config => config.modelNumber);
  }

  _initializeConfigs() {
    this.configPaths.forEach(configPath => {
      const result = readYaml.sync(configPath);

      if (result) {
        const config = DysonDeviceConfig.build(result);

        this._configMap.set(config.modelNumber, config);
        debug(`config set for model '${JSON.stringify(config)}'`);
      }
    });
  }
}

class DysonDeviceConfig {
  static build(config) {
    return new DysonDeviceConfig(config);
  }
  constructor(config) {
    this.manufacturer = 'Dyson';
    this.name = config.name;
    this.key = config.key;
    this.modelNumber = config.modelNumber.toString();
    this.mqtt = config.mqtt;

    this.controls = this._tranformControls(config.controls);
  }

  get displayName() {
    return `${this.manufacturer} ${this.name}`;
  }

  get searchTokens() {
    return [this.key, this.modelNumber];
  }

  /**
   * Transforms controls
   *
   * @example
   * _tranformControls({ buttons: ['POWER_OFF']})
   * returns
   * { buttons: [{ name: 'POWER_OFF', label: 'Power Off' }] }
   * @param {*} controls
   */
  _tranformControls(controls) {
    const transformed = {};
    Object.keys(controlsConfig).forEach(controlType => {
      transformed[controlType] = [];

      if (controls[controlType] && controls[controlType].length) {
        transformed[controlType] = controls[controlType].map(controlName => controlsConfig[controlType][controlName]);
      }
    });

    return transformed;
  }
}

module.exports = DysonDeviceConfigManager;
