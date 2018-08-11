const mqttV3Options = {
  protocolVersion: 3,
  protocolId: 'MQIsdp'
};

const dysonPureConfig = {
  438: {
    displayName: 'Dyson Pure Cool Tower (TP04)',
    mqttOptions: mqttV3Options
  },
  520: {
    displayName: 'Dyson Pure Cool Desk (DP04)',
    mqttOptions: mqttV3Options
  }
  // TODO extend for all pure link devices
};

const supportedDysonPureModels = Object.keys(dysonPureConfig);

function getDysonPureConfigByModel(model) {
  return dysonPureConfig[model];
}

module.exports = {
  supportedDysonPureModels,
  getDysonPureConfigByModel
};
