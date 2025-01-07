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
  test() {
    this.dailyTask()
  }

  parseTemplate(templates) {
    this.weatherTemplate = templates.find(item => item.type === 'weather').template;
    this.lunarTemplate = templates.find(item => item.type === 'lunar').template;
    this.normalTemplate = templates.find(item => item.type !== 'weather' && item.type !== 'lunar').template;
  }
  async dailyTask() {
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

module.exports = GYHDSB;
