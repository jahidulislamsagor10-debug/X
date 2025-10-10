const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "dalle",
    aliases: ["aiimg", "imagegen"],
    version: "1.2",
    author: "SaGor",
    countDown: 15,
    role: 0,
    shortDescription: "Generate 4 small images using DALL·E proxy",
    longDescription: "Generates 4 smaller images for a prompt and sends them together",
    category: "AI",
    guide: "{pn} <your prompt>"
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ").trim();
    if (!prompt) return api.sendMessage(
      "⚠️ Please provide a prompt.\nExample: dalle cute cartoon dog",
      threadID,
      messageID
    );

    api.sendMessage("please wait...", threadID, messageID);

    const tempFiles = [];

    try {
      for (let i = 0; i < 4; i++) {
        const tempPath = path.join(__dirname, "cache", `${Date.now()}_${i}.png`);
        const randomSeed = Math.floor(Math.random() * 100000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${randomSeed}&size=256x256`;
        const response = await axios({ url, method: "GET", responseType: "arraybuffer" });
        fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));
        tempFiles.push(tempPath);
      }

      const attachments = tempFiles.map(f => fs.createReadStream(f));

      await api.sendMessage({
        body: `🎨 Prompt: ${prompt}`,
        attachment: attachments
      }, threadID, () => tempFiles.forEach(f => fs.unlinkSync(f)), messageID);

    } catch (e) {
      console.error(e);
      tempFiles.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
      api.sendMessage("❌ Failed to generate images.", threadID, messageID);
    }
  }
};
