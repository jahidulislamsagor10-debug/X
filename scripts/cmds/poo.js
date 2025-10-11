module.exports = {
  config: {
    name: "poo",
    version: "1.0.0",
    role: 0,
    author: "SaGor",
    description: "Send a meme with a tagged person stepping in poo",
    category: "meme",
    usages: "[tag someone]",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const jimp = require("jimp");
    const request = require("request");

    const __root = path.resolve(__dirname, "cache/canvas");
    if (!fs.existsSync(__root)) fs.mkdirSync(__root, { recursive: true });

    const baseImagePath = path.join(__root, "poo.png");
    if (!fs.existsSync(baseImagePath)) {
      await new Promise(resolve => {
        request("https://i.imgur.com/5qT35LF.png").pipe(fs.createWriteStream(baseImagePath)).on("close", resolve);
      });
    }

    const mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("❌ Please tag someone!", event.threadID, event.messageID);

    const makeImage = async (userID) => {
      const base = await jimp.read(baseImagePath);
      const avatarPath = path.join(__root, `avt_${userID}.png`);
      const avatarData = (await axios.get(`https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(avatarPath, Buffer.from(avatarData, 'utf-8'));

      const avatarCircle = await jimp.read(await (async img => {
        let image = await jimp.read(img);
        image.circle();
        return await image.getBufferAsync("image/png");
      })(avatarPath));

      base.composite(avatarCircle.resize(100, 100), 390, 680);

      const outPath = path.join(__root, `poo_${userID}.png`);
      await base.writeAsync(outPath);
      fs.unlinkSync(avatarPath);
      return outPath;
    };

    const imagePath = await makeImage(mention);
    const nameTag = event.mentions[mention].replace("@", "");

    return api.sendMessage({
      body: `${nameTag} Ew, I stepped in a shit 💩`,
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
  }
};
