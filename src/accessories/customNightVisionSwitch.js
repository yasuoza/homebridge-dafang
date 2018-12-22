//
//  CustomNightVisionSwitch.js
//  Yasuharu Ozaki
//
//  Created by Yasuhru Ozaki on 22/12/2018.
//  Copyright © 2018 yasuoza.com. All rights reserved.
//

const Accessory = require('./base/base')

const CustomNightVisionSwitch = class extends Accessory {
  constructor(log, config, accessory, homebridge, mqttService) {
    super(log, config, accessory, homebridge, mqttService)
    this.isOn = false
    this.configureMqtt()
  }

  getAccessoryServices() {
    const nightVisionSwitch = new this.homebridge.Service.Switch(this.config.name)
    nightVisionSwitch
      .getCharacteristic(this.homebridge.Characteristic.On)
      .on('get', this.getState.bind(this))
      .on('set', this.switchStateChanged.bind(this))
    return [nightVisionSwitch]
  }

  configureMqtt() {
    this.subscribeToMQTT('/ir_cut')
  }

  mqttRecieved(res) {
    if (res.payload === 'OFF') {
      this.updateState(true)
    } else if (res.payload === 'ON') {
      this.updateState(false)
    }
  }

  switchStateChanged(newState, callback) {
    const newValue = !this.isOn
    this.updateState(newValue)
    var pubTopic = ''
    if (newValue === true) {
      this.publishToMQTT('/set', 'toggle-rtsp-nightvision-on');
      this.publishToMQTT('/ir_cut/set', 'OFF');
    } else {
      this.publishToMQTT('/set', 'toggle-rtsp-nightvision-off');
      this.publishToMQTT('/ir_cut/set', 'ON');
    }
    callback()
  }

  updateState(isOn) {
    if (isOn !== this.isOn) {
      this.log('Setting Custom Night Vision Switch Value to ' + isOn)
    }
    this.isOn = isOn
    const res = this.isOn
    this.services[0]
      .getCharacteristic(this.homebridge.Characteristic.On)
      .updateValue(this.encodeState(res))
  }

  getState(callback) {
    callback(null, this.encodeState(this.getStateFromCache()))
  }

  encodeState(state) {
    if (state) {
      return true
    }

    return false
  }

  getStateFromCache() {
    return this.isOn
  }

  getModelName() {
    return 'Custom Night Vision Switch'
  }

  getSerialNumber() {
    return '00-001-ActionSwitch'
  }
}

module.exports = CustomNightVisionSwitch;
