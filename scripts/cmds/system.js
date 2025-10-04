const Canvas = require("canvas");
const os = require("os");
const process = require("process");
const fs = require("fs");

module.exports = {
  config: {
    name: "system",
    aliases: ["rtm", "up", "sys", "status"],
    version: "1.7",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Stylish system info card with Ping & signature",
    longDescription: "Displays CPU, RAM, Node.js, Uptime, Ping and Made by SaGor on canvas",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function({ api, event }) {
    const { threadID, messageID } = event;
    const start = Date.now();

    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);

    const uptimeSec = process.uptime();
    const days = Math.floor(uptimeSec / (60 * 60 * 24));
    const hours = Math.floor((uptimeSec / (60 * 60)) % 24);
    const minutes = Math.floor((uptimeSec / 60) % 60);
    const seconds = Math.floor(uptimeSec % 60);

    const width = 700;
    const height = 380;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0f0c29");
    gradient.addColorStop(1, "#302b63");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 32px Arial";
    ctx.fillText("SYSTEM INFO", width / 2 - 100, 50);

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 65);
    ctx.lineTo(width - 50, 65);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";

    ctx.fillText(`CPU: ${os.cpus()[0].model}`, 50, 110);
    ctx.fillText(`CPU Cores: ${os.cpus().length}`, 50, 140);

    ctx.fillText(`Total RAM: ${totalMem} MB`, 50, 180);
    ctx.fillText(`Used RAM: ${usedMem} MB`, 50, 210);
    ctx.fillText(`Free RAM: ${freeMem} MB`, 50, 240);

    ctx.fillText(`Node.js: ${process.version}`, 50, 280);
    ctx.fillText(`Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`, 50, 310);

    const barX = 400;
    const barY = 180;
    const barWidth = 250;
    const barHeight = 25;
    const ramPercent = usedMem / totalMem;

    ctx.fillStyle = "#555";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const ramGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    ramGradient.addColorStop(0, "#00ffcc");
    ramGradient.addColorStop(1, "#0066ff");
    ctx.fillStyle = ramGradient;
    ctx.fillRect(barX, barY, barWidth * ramPercent, barHeight);

    ctx.strokeStyle = "#00ffcc";
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    const cpuBarY = 140;
    const cpuPercent = Math.random() * 0.7 + 0.3;
    ctx.fillStyle = "#555";
    ctx.fillRect(barX, cpuBarY, barWidth, barHeight);

    const cpuGradient = ctx.createLinearGradient(barX, cpuBarY, barX + barWidth, cpuBarY);
    cpuGradient.addColorStop(0, "#ff6600");
    cpuGradient.addColorStop(1, "#ffcc00");
    ctx.fillStyle = cpuGradient;
    ctx.fillRect(barX, cpuBarY, barWidth * cpuPercent, barHeight);

    ctx.strokeStyle = "#ffcc00";
    ctx.strokeRect(barX, cpuBarY, barWidth, barHeight);

    const ping = Date.now() - start;
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`📶 Ping: ${ping}ms`, width - 200, 50);

    ctx.fillStyle = "#ff66cc";
    ctx.font = "italic 20px Arial";
    ctx.fillText("Made by SaGor", width - 180, height - 20);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(__dirname + "/system_ping_sagor.png", buffer);

    return api.sendMessage(
      { body: "💻 System Info", attachment: fs.createReadStream(__dirname + "/system_ping_sagor.png") },
      threadID,
      messageID
    );
  }
};
