const schedule = require('node-schedule');
const axios = require('axios');
const lunarCalendar = require('lunar-calendar');

class GYHDSB {
  constructor(config) {
    this.config = config;
    this.locations = config.locations;
    this.qweatherKey = config.qweatherKey || 'eae5f0ea8fd64af497086fdcf2b4aa0e';
    this.webhookUrl = config.webhookUrl;
    this.crontab = config.crontab;

    this.result = [];
    this.templates = config.templates;
    this.parseTemplate(config.templates);
    this.run()
  }
  run() {
    let rule = new schedule.RecurrenceRule();
    rule.hour = this.config.hour;
    rule.minute = this.config.minute || 0;
    rule.second = this.config.second || 0;
    rule.tz = 'Asia/Shanghai'
    const task = schedule.scheduleJob(rule, () => {
      this.dailyTask()
    });
  }
  async test() {
    const content = await this.getContent();
    console.log(content, this.result)
  }
  send() {
    this.dailyTask()
  }

  parseTemplate(templates) {
    this.weatherTemplate = templates.find(item => item.type === 'weather').template;
    this.lunarTemplate = templates.find(item => item.type === 'lunar').template;
    this.normalTemplate = templates.find(item => item.type !== 'weather' && item.type !== 'lunar').template;
  }
  async getContent() {
    this.getLunarData()
    await this.getWeatherData()
    let content = ''
    this.templates.forEach(item => {
      if (item.type === 'weather') {
        content += this.weatherContent.join('')
      } else if (item.type === 'lunar') {
        content += this.templateReplace(item.template, this.lunarData)
      } else {
        content += item.template
      }
    })
    return content;
  }
  async dailyTask() {
    const content = await this.getContent();
    axios.post(this.webhookUrl, {
      msgtype: 'markdown',
      markdown: {
        content
      },
    });
  }
  
  getLunarData() {
    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const lunar = lunarCalendar.solarToLunar(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    this.lunarData = {
      ...lunar,
      today
    }
    
  }
  getWeatherData() {
    this.weatherContent = []
    return new Promise((resolve) => {
      this.#processArray(this.locations).then(() => {
        resolve(this.result)
      })
    })
  }
  async #processArray(array) {
    for (let item of array) {
      await this.#processItem(item);
    }
  }

  async #processItem(item) {
    return new Promise((resolve) =>
      axios
        .get(
          `https://devapi.qweather.com/v7/weather/3d?location=${item.location}&key=${this.qweatherKey}`
        )
        .then((res) => {
          const data = res.data.daily[0];
          data.visCN = getVisCN(data.vis);
          const [windScaleDayMinCN, windScaleDayCN] = getWindScaleCN(data.windScaleDay);
          const [windScaleNightMinCN, windScaleNightCN] = getWindScaleCN(data.windScaleDay);

          data.windScaleDayMinCN = windScaleDayMinCN;
          data.windScaleDayCN = windScaleDayCN;

          data.windScaleNightMinCN = windScaleNightMinCN;
          data.windScaleNightCN = windScaleNightCN;

          data.name = item.name;
          data.location = item.location;
          const text = this.templateReplace(this.weatherTemplate, data);
          this.weatherContent.push(text);
          this.result.push(data);
          resolve();
          
        })
    );
  }
  templateReplace(template, data) {
    return template.replace(/{(.*?)}/g, (match, key) => data[key]);
  }
}



function getVisCN(vis) {
  let description;
  if (vis > 10) {
    description = '极佳';
  } else if (vis > 4) {
    description = '较好';
  } else if (vis > 2) {
    description = '良好';
  } else if (vis > 1) {
    description = '轻雾';
  } else if (vis > 0.5) {
    description = '雾天';
  } else if (vis > 0.2) {
    description = '大雾';
  } else if (vis > 0.05) {
    description = '浓雾';
  } else {
    description = '强浓雾';
  }

  return description;
}

function getWindScaleCN(windScale) {
  const [min, max] = windScale.split('-');
  const windScaleCN = {
    0: '无风',
    1: '软风',
    2: '轻风',
    3: '微风',
    4: '和风',
    5: '清风',
    6: '强风',
    7: '疾风',
    8: '大风',
    9: '烈风',
    10: '狂风',
    11: '暴风',
    12: '飓风',
    13: '台风',
    14: '强台风',
    15: '强台风',
    16: '超强台风',
    17: '超强台风'
  }
  const minCN = windScaleCN[min];
  const maxCN = windScaleCN[max] || '超强台风';

  return[minCN, maxCN];
}

module.exports = GYHDSB;
