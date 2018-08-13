const path = require('path');
const readYaml = require('read-yaml');
const controls = {};

const configFilePath = path.join(__dirname, 'config/', 'controls.yaml');
const config = readYaml.sync(configFilePath);
const controlTypes = Object.keys(config);

controlTypes.forEach(controlType => {
  controls[controlType] = {};

  config[controlType].forEach(control => {
    controls[controlType][control.name] = control;
  });
});

module.exports = controls;
