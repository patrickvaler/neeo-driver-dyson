const path = require('path');
const fs = require('fs');

const DysonDeviceConfigManager = require('../dyson-device-config-manager');

const baseConfigPath = path.join(__dirname, 'config');
const configPaths = fs.readdirSync(baseConfigPath).map(filename => path.join(baseConfigPath, filename));
const deviceConfig = DysonDeviceConfigManager.build(configPaths);

module.exports = deviceConfig;
