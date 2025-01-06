const cron = require('node-cron');
const axios = require('axios');
const lunarCalendar = require('lunar-calendar');

class GYHDSB {
  constructor(config) {
    this.config = config;
    this.locations = config.locations;
    this.qweatherKey = config.qweatherKey;
    this.webhookUrl = config.webhookUrl;
    this.cron = config.cron;
    this.result = [];
  }
  run() {
    const crontab = this.cron || '0 8 * * *';
    cron.schedule(crontab, this.dailyTask);
  }
  test() {
    this.dailyTask()
  }

  getData() {
    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const lunar = lunarCalendar.solarToLunar(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return new Promise((resolve) => {
      this.#processArray(this.locations).then(() => {
        resolve({
          weatherData: this.result,
          lunarData: {
            ...lunar,
            today
          }
        })
      })
    })
    
  }
  setContent(content) {
    this.content = content
  }
  dailyTask() {
    const content = this.content;
    axios.post(this.webhookUrl, {
      msgtype: 'markdown',
      markdown: {
        content
      },
    });
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
          this.result.push(data);
          resolve();
          
        })
    );
  }
}

module.exports = GYHDSB;
