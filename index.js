const dysonTp04Driver = require('./lib');

module.exports = {
  devices: [
    // Exports listed here will be detected,
    // these are the objects returned by neeo-sdk.buildDevice()
    dysonTp04Driver
  ]
};
