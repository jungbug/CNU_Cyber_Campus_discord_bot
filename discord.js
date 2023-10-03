const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const moment = require('moment-timezone');

const schedule = require('node-schedule-tz')

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 23;
rule.minute = 59;
rule.tz = 'Asia/Seoul';

moment.tz.setDefault("Asia/Seoul");
let MM = moment().format("MM")
let DD = moment().format("DD")

const client = new Discord.Client({ intents: [
  Discord.GatewayIntentBits.Guilds,
  Discord.GatewayIntentBits.GuildMessages
]})

let result = [1,0]

require('dotenv').config()
const TOKEN = process.env.TOKEN;
const ID = process.env.ID;
const PW = process.env.PW;
const CHANNEL_ID = process.env.CHANNEL_ID;

let channel = null

client.on("ready", () => {
  channel = client.channels.cache.get(CHANNEL_ID);
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on("messageCreate", async (message) => {
  if (message.author.bot) return false; 
  
  message.reply(`성윤님 ${MM}월 ${DD}일 ${result[0]}개의 todo와 ${result[1]}개의 동영상 강의가 있습니다.`);
});



async function init(){
  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  await page.goto('https://dcs-lcms.cnu.ac.kr/login?redirectUrl=https://dcs-lcms.cnu.ac.kr/');
  
  setTimeout(async () => {
    await page.click(".univ_select_box")
    await page.click("#drawUniv_list > li:nth-child(4) > a > span:nth-child(2)")
    await page.type(".id_insert", ID);
    await page.type(".pw_insert", PW);
    await page.click(".btn_login_normal");

    setTimeout(async () => {
      const divSelector = '.todolist > a > span';
      const divText = await page.evaluate((selector) => {
        const div = document.querySelector(selector);
        return div ? div.textContent : null;
      }, divSelector);
    
      console.log(divText);
      result[0] = divText;
      console.log(MM, DD)
    
      await page.click(".btn_lectureroom");
    // 동영상 강의 구현 해야됨
      await browser.close();
      return divText;
    }, 6000);
  }, 1000);
  
}

setInterval(() => {
  init()
}, 3.6e+6);

schedule.scheduleJob(rule, () => {
  // const channel = client.channels.cache.get(CHANNEL_ID);

  if (!channel) {
    console.error(`Channel with ID ${CHANNEL_ID} not found.`);
    return;
  }

  channel.send(`성윤님 ${MM}월 ${DD}일 ${result[0]}개의 todo와 ${result[1]}개의 동영상 강의가 있습니다.`);
})

client.login(TOKEN);
