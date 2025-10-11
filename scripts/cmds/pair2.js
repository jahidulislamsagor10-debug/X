const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "pair2",
    version: "1.0",
    author: "SaGor",
    cooldowns: 5,
    role: 0,
    shortDescription: "Randomly pair users with a fun image",
    longDescription: "Pairs the sender with another user and generates a canvas image showing both",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function({ api, event }) {
    const { threadID, senderID, messageID } = event;
    const __root = path.resolve(__dirname, "cache");
    if (!fs.existsSync(__root)) fs.mkdirSync(__root, { recursive: true });

    const pathImg = path.join(__root, "background.png");
    const pathAvt1 = path.join(__root, "Avt1.png");
    const pathAvt2 = path.join(__root, "Avt2.png");

    const senderData = await api.getUserInfo(senderID);
    const name1 = senderData[senderID].name;

    const threadInfo = await api.getThreadInfo(threadID);
    const allUsers = threadInfo.userInfo;

    let gender1;
    for (let u of allUsers) if (u.id == senderID) gender1 = u.gender;

    const botID = api.getCurrentUserID();
    let candidates = [];

    if (gender1 === "FEMALE") {
      for (let u of allUsers) if (u.gender === "MALE" && u.id != senderID && u.id != botID) candidates.push(u.id);
    } else if (gender1 === "MALE") {
      for (let u of allUsers) if (u.gender === "FEMALE" && u.id != senderID && u.id != botID) candidates.push(u.id);
    } else {
      for (let u of allUsers) if (u.id != senderID && u.id != botID) candidates.push(u.id);
    }

    if (candidates.length === 0) {
      for (let u of allUsers) if (u.id != senderID && u.id != botID) candidates.push(u.id);
    }

    const id2 = candidates[Math.floor(Math.random() * candidates.length)];
    const partnerData = await api.getUserInfo(id2);
    const name2 = partnerData[id2].name;

    const odds = Math.floor(Math.random() * 101) + "%";
    const backgrounds = [
      "https://i.postimg.cc/wjJ29HRB/background1.png",
      "https://i.postimg.cc/zf4Pnshv/background2.png",
      "https://i.postimg.cc/5tXRQ46D/background3.png"
    ];
    const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    const getAvt1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvt1, "utf-8"));

    const getAvt2 = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvt2, "utf-8"));

    const getBg = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getBg, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar1, 100, 150, 300, 300);
    ctx.drawImage(avatar2, 900, 150, 300, 300);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    api.sendMessage({
      body: `💖 Congratulations ${name1} was paired with ${name2}\nPair odds: ${odds}`,
      mentions: [{ id: id2, tag: name2 }],
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);
  }
};
