const GYHDSB = require('gyhdsb-robot');

const gyhdsb_robot = new GYHDSB({
  qweatherKey: 'eae5f0ea8fd64af497086fdcf2b4aa0e',
  webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5f8e0ef1-c861-47b4-9e2e-60ae7fe7bc89',
  locations: [{
    location: '101220101',
    name: '合肥',
  }, {
    location: '101190401',
    name: '苏州',
  }],
  cron: '0 8 * * *'
});

gyhdsb_robot.getData().then(data => {
  const { weatherData, lunarData } = data;
  console.log(weatherData, lunarData) // weatherData-天气数据 lunarData-农历数据
  let content = 'Dear all😘'  // 微信机器人消息模板，自定义拼接
  weatherData.forEach(item => {
    content += `
📍${item.name}:
· 今日气温${item.tempMin} ~ ${item.tempMax}℃ ${item.textDay} 
. 日出 ${item.sunrise} 日落 ${item.sunset}
· 今日风况 ${item.windDirDay} ${item.windScaleDay}级
        [点击查看详情](https://www.qweather.com/weather/${item.name}-${item.location}.html) 
`
  })
  content += `
${lunarData.today}
农历${lunarData.lunarMonthName} ${lunarData.lunarDayName}`


  gyhdsb_robot.setContent(content) // 设置最终模板数据

  // 按cron表达式定时执行
  // gyhdsb_robot.run();
  // 测试立即执行使用
  gyhdsb_robot.test();
});