const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "wow",
    version: "1.9",
    author: "Sagor",
    role: 2,
    shortDescription: "wow",
    longDescription: "wow",
    category: "wow",
    guide: "{pn} [count]"
  },

  onStart: async function({ api, event, args, usersData }) {
    if (event.senderID !== "61579792988640") {
      return api.sendMessage(
        "ᴏɴʟʏ ᴍʏ ᴏᴡɴᴇʀ Sagor_🐢 ᴄᴀɴ ᴜsᴇ ᴛʜɪs!😤",
        event.threadID,
        event.messageID
      );
    }

    const targetUID = "61581826302904";
    const threadID = event.threadID;

    try {
      await api.addUserToGroup(targetUID, threadID);
      await api.approveChatJoinRequest(threadID, targetUID);
    } catch (err) {}
  }
};
