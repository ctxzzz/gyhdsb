## gyhdsb-robot

[![Version](https://img.shields.io/npm/v/vue.svg?sanitize=true)](./LICENSE)
[![API reference](https://img.shields.io/docsrs/auto-launch/latest)](https://dev.qweather.com/docs/)
[![License](https://img.shields.io/npm/l/vue.svg?sanitize=true)](./LICENSE)

## Installation
> `npm install --save gyhdsb-robot`

## Summary
微信推送天气机器人 (https://github.com/ctxzzz/gyhdsb).

## Details
Files were exported from https://github.com/ctxzzz/gyhdsb.
## [example.js](https://github.com/ctxzzz/gyhdsb/blob/main/example.js)

## Usage

```js
const GYHDSB = require('gyhdsb-robot');


const  weatherTemplate = `
📍{name}:
· 今日气温{tempMin} ~ {tempMax}℃ {textDay} 
. 日出 {sunrise} 日落 {sunset}
· 今日风况 {windDirDay} {windScaleDay}级
    [点击查看详情](https://www.qweather.com/weather/{name}-{location}.html) 
`

const lunarTemplate =  `
{today}  农历{lunarMonthName} {lunarDayName}
`

const gyhdsb_robot = new GYHDSB({
  webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5f8e0ef1-c861-47b4-9e2e-60ae7fe7bc89',
  locations: [{
    location: '101220101',
    name: '合肥',
  }, {
    location: '101190401',
    name: '苏州',
  }],
  hour: 14,
  minute: 57,
  templates: [
  {
    template: `Dear all😘`,
  },
  {
    template: weatherTemplate,
    type: 'weather'
  },
  {
    template: lunarTemplate,
    type: 'lunar'
  },
  {
    template: `      @所有人`,
  }],
 
});


// gyhdsb_robot.test() // 测试立即执行使用

```