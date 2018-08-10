# Dyson Response Documentation

## Mqtt Events

### message

#### Current State

```json
{
  "msg": "CURRENT-STATE",
  "time": "2018-08-05T12:31:13.000Z",
  "mode-reason": "PRC",
  "state-reason": "MODE",
  "dial": "OFF",
  "rssi": "-57",
  "channel": "36",
  "product-state": {
    "fpwr": "OFF",
    "fdir": "ON",
    "auto": "OFF",
    "oscs": "OFF",
    "oson": "OFF",
    "nmod": "OFF",
    "rhtm": "ON",
    "fnst": "OFF",
    "ercd": "09C1",
    "wacd": "NONE",
    "nmdv": "0004",
    "fnsp": "0006",
    "bril": "0002",
    "corf": "ON",
    "cflr": "0099",
    "hflr": "0099",
    "sltm": "OFF",
    "osal": "0232",
    "osau": "0232",
    "ancp": "CUST"
  },
  "scheduler": { "srsc": "000000005b6338a1", "dstv": "0001", "tzid": "0001" }
}
```

#### State Change

```json
{
  "msg": "STATE-CHANGE",
  "time": "2018-08-05T12:33:32.000Z",
  "mode-reason": "LAPP",
  "state-reason": "MODE",
  "product-state": {
    "fpwr": ["ON", "ON"],
    "fdir": ["ON", "ON"],
    "auto": ["ON", "ON"],
    "oscs": ["OFF", "OFF"],
    "oson": ["OFF", "OFF"],
    "nmod": ["OFF", "OFF"],
    "rhtm": ["ON", "ON"],
    "fnst": ["FAN", "FAN"],
    "ercd": ["09C1", "09C1"],
    "wacd": ["NONE", "NONE"],
    "nmdv": ["0004", "0004"],
    "fnsp": ["AUTO", "AUTO"],
    "bril": ["0002", "0002"],
    "corf": ["ON", "ON"],
    "cflr": ["0099", "0099"],
    "hflr": ["0099", "0099"],
    "sltm": ["OFF", "OFF"],
    "osal": ["0232", "0232"],
    "osau": ["0232", "0232"],
    "ancp": ["CUST", "CUST"]
  }
}
```

#### Current Sensor Data

```json
{
  "msg": "ENVIRONMENTAL-CURRENT-SENSOR-DATA",
  "time": "2018-08-05T12:31:14.000Z",
  "data": {
    "tact": "3029",
    "hact": "0046",
    "pm25": "0019",
    "pm10": "0012",
    "va10": "0009",
    "noxl": "0005",
    "p25r": "0020",
    "p10r": "0019",
    "sltm": "OFF"
  }
}
```

### connect

TODO

### error

TODO
