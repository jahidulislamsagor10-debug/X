module.exports = {
  config: {
    name: "ping",
    version: "1.2.1",
    hasPermssion: 0,
    credits: "SAGOR",
    description: "Ultra-fast ping with progress bar",
    commandCategory: "System",
    usages: "ping",
    cooldowns: 3
  },

  onStart: async function ({ api, event }) {
    const startTime = Date.now();
    const frames = [
      "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒",
      "████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒",
      "████████▒▒▒▒▒▒▒▒▒▒▒▒",
      "████████████▒▒▒▒▒▒▒▒",
      "████████████████▒▒▒▒",
      "████████████████████"
    ];

    const msg = await api.sendMessage(frames[0], event.threadID);

    const delays = [30, 30, 30, 30, 30];

    for (let i = 1; i < frames.length; i++) {
      await new Promise(res => setTimeout(res, delays[i - 1]));
      await api.editMessage(frames[i], msg.messageID);
    }

    const realPing = Date.now() - startTime;
    api.editMessage(`🏓 Ping!\n📶 Response Time: ${realPing}ms`, msg.messageID);
  }
};
