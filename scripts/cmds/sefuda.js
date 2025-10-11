const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "sefuda",
    version: "1.0.0",
    role: 0,
    author: "SaGor",
    description: "Generate a custom image with your text",
    category: "fun",
    usages: "[text]",
    cooldowns: 5,
    dependencies: {
      "axios": "",
      "fs-extra": "",
      "canvas": ""
    }
  },

  wrapText: (ctx, text, maxWidth) => {
    return new Promise(resolve => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      const words = text.split(' ');
      const lines = [];
      let line = '';
      while (words.length > 0) {
        let testLine = line + words[0] + ' ';
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(line.trim());
          line = '';
        } else {
          line = testLine;
          words.shift();
        }
      }
      if (line) lines.push(line.trim());
      resolve(lines);
    });
  },

  onStart: async function ({ api, event, args }) {
    const { senderID, threadID, messageID } = event;
    const text = args.join(" ");
    if (!text) return api.sendMessage("Enter some text to generate the image!", threadID, messageID);

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imgPath = path.join(cacheDir, "sefuda.png");

    try {
      const imgData = (await axios.get(
        "https://i.postimg.cc/W3pxb1Xg/Pics-Art-08-14-11-06-32.jpg",
        { responseType: "arraybuffer" }
      )).data;
      fs.writeFileSync(imgPath, Buffer.from(imgData));

      const baseImage = await loadImage(imgPath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.font = "bold 45px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "start";

      let fontSize = 250;
      while (ctx.measureText(text).width > 2600) {
        fontSize--;
        ctx.font = `bold ${fontSize}px Arial`;
      }

      const lines = await this.wrapText(ctx, text, 1160);
      ctx.fillText(lines.join("\n"), 60, 165);

      fs.writeFileSync(imgPath, canvas.toBuffer());
      return api.sendMessage({ attachment: fs.createReadStream(imgPath) }, threadID, () => fs.unlinkSync(imgPath), messageID);

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ Failed to generate image. Try again later!", threadID, messageID);
    }
  }
};
