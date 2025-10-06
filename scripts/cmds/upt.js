module.exports = {
  config: {
    name: "upt",
    aliases: ["upt"],
    version: "9.1",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Show uptime with fast loading bar",
    longDescription: "Fast animated loading bar with real uptime progress",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const frames = [
      "▒░░░░░░░░░░░░░░░░░░░░░",
      "▒▒▒░░░░░░░░░░░░░░░░░░░",
      "▒▒▒▒▒░░░░░░░░░░░░░░░░░",
      "▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░",
      "▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░",
      "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░",
      "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"
    ];
    const msg = await api.sendMessage(`${frames[0]}`, threadID, messageID);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= frames.length) {
        clearInterval(interval);
        const uptime = process.uptime();
        const days = Math.floor(uptime / (60 * 60 * 24));
        const hours = Math.floor((uptime / (60 * 60)) % 24);
        const minutes = Math.floor((uptime / 60) % 60);
        const seconds = Math.floor(uptime % 60);
        const totalSeconds = 24 * 60 * 60;
        const currentSeconds = (hours * 3600) + (minutes * 60) + seconds;
        const percent = Math.min(100, ((currentSeconds / totalSeconds) * 100).toFixed(1));
        const totalBlocks = 20;
        const filledBlocks = Math.round((percent / 100) * totalBlocks);
        const bar = "█".repeat(filledBlocks) + "░".repeat(totalBlocks - filledBlocks);
        let emoji = "🟢";
        if (percent < 30) emoji = "🔴";
        else if (percent < 70) emoji = "🟡";
        else if (percent < 95) emoji = "🟠";
        const finalMsg = 
`🤖 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 ⏱️
━━━━━━━━━━━━━━
${bar} ${emoji} ${percent}%
📆 Days: ${days}
⏰ Hours: ${hours}
🕒 Minutes: ${minutes}
⏱ Seconds: ${seconds}
━━━━━━━━━━━━━━
💚 Bot is running 💨`;
        return api.editMessage(finalMsg, msg.messageID);
      } else {
        api.editMessage(`${frames[i++]}`, msg.messageID);
      }
    }, 50);
  }
};
