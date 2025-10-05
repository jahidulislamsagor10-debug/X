const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

module.exports = {
  config: {
    name: "autodl",
    version: "1.0",
    credits: "SaGor",
    role: 0,
    shortDescription: "Auto video downloader",
    longDescription: "Automatically downloads and sends videos when a link is detected.",
    category: "media",
    countDown: 5,
  },

  onChat: async function ({ api, event }) {
    const msg = event.body;
    if (!msg) return;

    const linkMatch = msg.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const url = linkMatch[0];
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const { title, filePath } = await downloadVideo(url);
      api.sendMessage(
        {
          body: `🎬 Title: ${title}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    } catch (err) {
      console.error("Error downloading video:", err.message);
      api.sendMessage("❌ Error downloading video.", event.threadID, event.messageID);
    }
  },
};
