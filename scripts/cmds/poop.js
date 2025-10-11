module.exports = {
  config: {
    name: "poop",
    version: "1.0.5",
    author: "SaGor",
    description: "💩 Make someone step in poop!",
    category: "fun",
    countDown: 5,
    role: 0,
    guide: {
      en: "{pn} [tag someone]"
    }
  },

  circle: async (imageBuffer) => {
    const jimp = require("jimp");
    const image = await jimp.read(imageBuffer);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  onStart: async function({ api, event }) {
    const fs = require("fs-extra");
    const Canvas = require("canvas");
    const axios = require("axios");

    try {
      const pathCache = __dirname + "/cache/";
      fs.ensureDirSync(pathCache);
      const pathToilet = pathCache + "poop.png";

      const id = Object.keys(event.mentions)[0] || event.senderID;

      // fetch avatar
      const avatarResp = await axios.get(
        `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      );

      const avatarCircle = await this.circle(avatarResp.data);

      // create canvas
      const canvas = Canvas.createCanvas(500, 670);
      const ctx = canvas.getContext("2d");
      const background = await Canvas.loadImage("https://i.imgur.com/tIwILb4.jpeg");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatarImg = await Canvas.loadImage(avatarCircle);
      ctx.drawImage(avatarImg, 135, 350, 205, 205);

      const buffer = canvas.toBuffer();
      fs.writeFileSync(pathToilet, buffer);

      api.sendMessage(
        {
          body: `💩 Watch out, ${event.mentions ? Object.values(event.mentions)[0].replace("@", "") : "someone"}!`,
          attachment: fs.createReadStream(pathToilet)
        },
        event.threadID,
        () => fs.unlinkSync(pathToilet),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to generate image! Check your tags or Facebook API.", event.threadID, event.messageID);
    }
  }
};
