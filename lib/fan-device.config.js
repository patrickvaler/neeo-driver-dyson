const mqttV3Options = {
  protocolVersion: 3,
  protocolId: 'MQIsdp'
};

const fanDeviceConfig = {
  438: {
    displayName: 'Dyson Pure Cool Tower (TP04)',
    mqttOptions: mqttV3Options
  },
  520: {
    displayName: 'Dyson Pure Cool Desk (TP04)',
    mqttOptions: mqttV3Options
  }
  // TODO extend for all pure link devices
};

const supportedFanDeviceModels = Object.keys(fanDeviceConfig);

function getFanDeviceConfigByModel(model) {
  return fanDeviceConfig[model];
}

module.exports = {
  supportedFanDeviceModels,
  getFanDeviceConfigByModel
};
