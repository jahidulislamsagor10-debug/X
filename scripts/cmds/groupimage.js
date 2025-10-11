module.exports = {
  config: {
    name: "gcimage",
    version: "1.0.0",
    author: "SaGor",
    longDescription: "Show the current group image",
    shortDescription: "Get group photo",
    category: "group",
    usages: "gcimage",
    cooldowns: 5,
    role: 0
  },

  onStart: async function ({ api, event }) {
    try {
      const thread = await api.getThreadInfo(event.threadID);
      const photo = thread.imageSrc;

      if (!photo) {
        return api.sendMessage("❌ | This group has no photo set.", event.threadID, event.messageID);
      }

      api.sendMessage({ body: "🖼️ | Group Photo:", attachment: await global.utils.getStreamFromURL(photo) }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | Failed to fetch the group photo.", event.threadID, event.messageID);
    }
  }
};
