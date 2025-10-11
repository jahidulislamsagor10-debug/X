const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "pair3",
    version: "1.0",
    author: "SaGor",
    role: 0,
    shortDescription: { en: "Pair two users randomly" },
    longDescription: { en: "Generates a pairing image between two users with random odds." },
    category: "fun",
    guide: { en: "{pn}" },
    cooldowns: 10
  },

  onLoad: async () => {
    const dir = path.resolve(__dirname, "cache/canvas");
    const filePath = path.join(dir, "pairing.png");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      const url = "https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png";
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data));
    }
  },

  onStart: async function({ api, event }) {
    const { threadID, senderID, messageID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID());
    if (!participants.length) return api.sendMessage("❌ No one to pair with!", threadID, messageID);

    const partnerID = participants[Math.floor(Math.random() * participants.length)];
    const usersInfo = await api.getUserInfo([senderID, partnerID]);
    const name1 = usersInfo[senderID]?.name || "Unknown";
    const name2 = usersInfo[partnerID]?.name || "Unknown";

    const oddsList = ['21%','11%','55%','89%','22%','45%','1%','4%','78%','15%','91%','77%','41%','32%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    const odds = oddsList[Math.floor(Math.random() * oddsList.length)];

    const __root = path.resolve(__dirname, "cache/canvas");
    const baseImgPath = path.join(__root, "pairing.png");
    const avatarOnePath = path.join(__root, `avt_${senderID}.png`);
    const avatarTwoPath = path.join(__root, `avt_${partnerID}.png`);
    const outPath = path.join(__root, `pairing_${senderID}_${partnerID}.png`);

    const getAvatar = async (id, filePath) => {
      const res = await axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, Buffer.from(res.data));
    };

    await getAvatar(senderID, avatarOnePath);
    await getAvatar(partnerID, avatarTwoPath);

    const makeCircle = async (imgPath) => {
      const image = await jimp.read(imgPath);
      image.circle();
      return await image.getBufferAsync("image/png");
    };

    const baseImg = await jimp.read(baseImgPath);
    const circleOne = await jimp.read(await makeCircle(avatarOnePath));
    const circleTwo = await jimp.read(await makeCircle(avatarTwoPath));
    baseImg.composite(circleOne.resize(150, 150), 980, 200).composite(circleTwo.resize(150, 150), 140, 200);
    const raw = await baseImg.getBufferAsync("image/png");
    fs.writeFileSync(outPath, raw);
    fs.unlinkSync(avatarOnePath);
    fs.unlinkSync(avatarTwoPath);

    api.sendMessage({
      body: `🍓 Congratulations ${name1} was paired with ${name2}\n🍓 The Double Odds are: ${odds}`,
      mentions: [{ id: partnerID, tag: name2 }],
      attachment: fs.createReadStream(outPath)
    }, threadID, () => fs.unlinkSync(outPath), messageID);
  }
};
