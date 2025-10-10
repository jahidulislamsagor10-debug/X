const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SaGor",
    description: "Upload image to ImgBB",
    commandCategory: "Uploader",
    usages: "imgbb [reply to photo]",
    cooldowns: 5
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID } = event;

    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("Please reply to a photo.", threadID, messageID);
    }

    try {
      const attachment = event.messageReply.attachments[0];
      const imageUrl = attachment.url;

      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const base64Image = Buffer.from(response.data, "binary").toString("base64");

      const apiResponse = await axios.post("https://imgbb-sagor-api.vercel.app/sagor/upload", {
        image: base64Image
      });

      const data = apiResponse.data;

      if (data.success) {
        api.sendMessage(`${data.url}`, threadID, messageID);
      } else {
        api.sendMessage("❌ Upload failed!", threadID, messageID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Something went wrong!", threadID, messageID);
    }
  }
};
