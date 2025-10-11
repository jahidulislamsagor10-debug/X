module.exports = {
  config: {
    name: "poo",
    version: "1.0.0",
    role: 0,
    author: "SaGor",
    description: "Send a meme with a tagged person stepping in poo",
    commandCategory: "meme",
    usages: "[tag]",
    cooldowns: 5,
  },

  onStart: async function ({ api, event, args }) {
    const fs = require("fs-extra");
    const path = require("path");
    const axios = require("axios");
    const jimp = require("jimp");
    const request = require("request");

    const __root = path.resolve(__dirname, "cache", "canvas");
    const dirMaterial = __root + "/";
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });

    const baseImagePath = dirMaterial + "poo.png";
    if (!fs.existsSync(baseImagePath)) {
      await new Promise(resolve => {
        request("https://i.imgur.com/5qT35LF.png").pipe(fs.createWriteStream(baseImagePath)).on("close", resolve);
      });
    }

    const mention = Object.keys(event.mentions)[0];
    if (!mention) return api.sendMessage("❌ Please tag someone!", event.threadID, event.messageID);

    const makeImage = async (userID) => {
      let point_image = await jimp.read(baseImagePath);
      let pathImg = dirMaterial + `/point_${userID}.png`;
      let avatarPath = dirMaterial + `/avt_${userID}.png`;

      let avatarData = (await axios.get(`https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(avatarPath, Buffer.from(avatarData, 'utf-8'));

      let circleAvatar = await jimp.read(await (async img => {
        let image = await jimp.read(img);
        image.circle();
        return await image.getBufferAsync("image/png");
      })(avatarPath));

      point_image.composite(circleAvatar.resize(100, 100), 390, 680);

      let buffer = await point_image.getBufferAsync("image/png");
      fs.writeFileSync(pathImg, buffer);
      fs.unlinkSync(avatarPath);

      return pathImg;
    };

    const pathImg = await makeImage(mention);
    const nameTag = event.mentions[mention].replace("@", "");

    return api.sendMessage({
      body: `${nameTag} Ew, I stepped in a shit 💩`,
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
  }
};
