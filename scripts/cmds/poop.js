module.exports = {
  config: {
    name: "poop",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "SaGor",
    description: "💩 Put a poop on tagged friend's avatar",
    commandCategory: "fun",
    usages: "poop [tag someone]",
    cooldowns: 5,
    dependencies: {
      "fs-extra": "",
      "axios": "",
      "canvas": "",
      "jimp": "",
      "node-superfetch": ""
    }
  },

  circle: async (image) => {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  onStart: async function ({ event, api }) {
    try {
      const Canvas = require("canvas");
      const request = require("node-superfetch");
      const fs = require("fs-extra");

      const pathPoop = __dirname + "/cache/poop.png";
      if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");

      // Get user ID
      const id = Object.keys(event.mentions)[0] || event.senderID;

      // Load background
      const canvas = Canvas.createCanvas(500, 670);
      const ctx = canvas.getContext("2d");
      const background = await Canvas.loadImage("https://i.imgur.com/tIwILb4.jpeg");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Load avatar
      const avatarRes = await request.get(
        `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const avatar = await this.circle(avatarRes.body);
      const avatarImg = await Canvas.loadImage(avatar);
      ctx.drawImage(avatarImg, 135, 350, 205, 205);

      // Save final image
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathPoop, imageBuffer);

      // Send
      api.sendMessage(
        { body: "💩", attachment: fs.createReadStream(pathPoop) },
        event.threadID,
        () => fs.unlinkSync(pathPoop),
        event.messageID
      );
    } catch (e) {
      return api.sendMessage("❌ Failed to generate image!", event.threadID, event.messageID);
    }
  }
};
