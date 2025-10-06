const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    version: "9.5",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Stylish uptime with Canvas bar",
    longDescription: "Canvas uptime bar with time stats",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    const canvas = Canvas.createCanvas(500, 200);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const minutes = Math.floor((uptime / 60) % 60);
    const seconds = Math.floor(uptime % 60);

    const totalSeconds = 24 * 60 * 60;
    const currentSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const percent = Math.min(100, ((currentSeconds / totalSeconds) * 100).toFixed(1));

    ctx.fillStyle = "#555";
    ctx.fillRect(50, 120, 400, 30);

    let fillColor = "#00FF00";
    if (percent < 30) fillColor = "#FF0000";
    else if (percent < 70) fillColor = "#FFFF00";
    else if (percent < 95) fillColor = "#FFA500";

    ctx.fillStyle = fillColor;
    ctx.fillRect(50, 120, 4 * percent, 30);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 120, 400, 30);

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText(`Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`, 50, 80);
    ctx.fillText(`Progress: ${percent}%`, 50, 180);

    const tempPath = path.join(__dirname, "uptime.png");
    fs.writeFileSync(tempPath, canvas.toBuffer());

    await api.sendMessage({ attachment: fs.createReadStream(tempPath) }, threadID, messageID);

    fs.unlinkSync(tempPath);
  }
};
