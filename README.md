# neeo-driver-dyson

[![npm version](https://badge.fury.io/js/neeo-driver-dyson.svg)](http://badge.fury.io/js/neeo-driver-dyson) [![Build Status](https://travis-ci.org/patrickvaler/neeo-driver-dyson.svg?branch=master)](https://travis-ci.org/patrickvaler/neeo-driver-dyson) [![Dependency Status](https://david-dm.org/patrickvaler/neeo-driver-dyson/status.svg?style=flat)](https://david-dm.org/patrickvaler/neeo-driver-dyson)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/patrickvaler/neeo-driver-dyson.svg)](https://greenkeeper.io/)

⚠️️ **This driver gets extended during the next couple of days/weeks**

## Supported Models

- Dyson Pure Cool Tower TP04 (2018)
- Dyson Pure Cool Desk DP04 (2018)

More Dyson Link devices are coming soon. You're Dyson Link device is missing? Please open an
[Issue](https://github.com/patrickvaler/neeo-driver-dyson/issues) to get it supported faster.

## Supported Components

### Buttons

- POWER ON
- POWER OFF
- SPEED UP
- SPEED DOWN

### Switches

- POWER SWITCH

More components are coming soon.

## How to install

Drivers for NEEO can be manged with `@neeo/cli`:

```
npm install -g @neeo/cli
```

Create a directory for your NEEO drivers. One directory can contain multiple drivers.
The `@neeo/cli` utility will automatically find the installed drivers and start them.

```
mkdir my-neeo-drivers
cd my-neeo-drivers
npm init -y
```

Configuration options like the IP address of the NEEO Brain will be configured in the `package.json` file in the created drivers directory.

```
{
  [...]
  "neeoSdkOptions": {
    "serverName": "neeo-server",
    "serverPort": 6336,
    "brainHost": ""
  }
}
```

You can find more info about the neeeo-cli utility at: https://github.com/NEEOInc/neeo-sdk-toolkit/tree/master/cli

Install this driver into the new NEEO drivers directory:

```
npm install --save neeo-driver-dyson
```

Start the installed drivers using the neeo-cli utility with:

```
neeo-cli start
```

## Configuration

**IMPORTANT:** At the moment this driver supports just one device and the password for the device has been set as `DYSON_FAN_PASSWORD` environment variable. You can use [dyson-cloud](https://github.com/patrickvaler/dyson-cloud) library to get the local credentials of your Dyson device.

It is planned to get rid of this limitation as soon as possible.
