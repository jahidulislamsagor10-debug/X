module.exports.config = {
    name: "pair4",
    version: "1.0.0",
    author: "SaGor",
    role: 0,
    description: "Pair with a random member in the group",
    category: "fun",
    cooldowns: 15,
    dependencies: {
        "axios": "",
        "fs-extra": "",
        "canvas": ""
    }
};

module.exports.onStart = async function ({ api, event, Users }) {
    const { loadImage, createCanvas } = require("canvas");
    const fs = require("fs-extra");
    const axios = require("axios");

    const { senderID, threadID, messageID } = event;

    try {
        // Ensure cache folder exists
        const cacheDir = __dirname + "/cache";
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        // Get thread members excluding sender and bot
        const threadInfo = await api.getThreadInfo(threadID);
        const botID = api.getCurrentUserID();
        const members = threadInfo.userInfo.filter(u => u.id !== senderID && u.id !== botID);

        if (members.length === 0) return api.sendMessage("❌ | No one to pair with!", threadID, messageID);

        // Pick a random partner
        const partner = members[Math.floor(Math.random() * members.length)];

        // Get user names with fallback
        let name1, name2;
        try { name1 = await Users.getNameUser(senderID); } catch { name1 = "User1"; }
        try { name2 = await Users.getNameUser(partner.id); } catch { name2 = "User2"; }

        const tileArr = ['21%','11%','55%','89%','22%','45%','1%','4%','78%','15%','91%','77%','41%','32%','67%','19%','37%','17%','96%','52%','62%','76%','83%','100%','99%','0%','48%'];
        const tile = tileArr[Math.floor(Math.random() * tileArr.length)];

        const backgrounds = [
            "https://i.postimg.cc/wjJ29HRB/background1.png",
            "https://i.postimg.cc/zf4Pnshv/background2.png",
            "https://i.postimg.cc/5tXRQ46D/background3.png"
        ];
        const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];

        const pathImg = cacheDir + "/pair4.png";
        const pathAvt1 = cacheDir + "/avt1.png";
        const pathAvt2 = cacheDir + "/avt2.png";

        // Download avatars and background
        const getAvatar1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathAvt1, Buffer.from(getAvatar1));

        const getAvatar2 = (await axios.get(`https://graph.facebook.com/${partner.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathAvt2, Buffer.from(getAvatar2));

        const getBackground = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathImg, Buffer.from(getBackground));

        // Create canvas
        const baseImage = await loadImage(pathImg);
        const baseAvt1 = await loadImage(pathAvt1);
        const baseAvt2 = await loadImage(pathAvt2);

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseAvt1, 100, 150, 300, 300);
        ctx.drawImage(baseAvt2, 900, 150, 300, 300);

        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);
        fs.removeSync(pathAvt1);
        fs.removeSync(pathAvt2);

        api.sendMessage({
            body: `🍓 Congratulations, ${name1} successfully paired with ${name2}!\n🍓 The odds are: ${tile}`,
            mentions: [{ id: partner.id, tag: name2 }],
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ | An error occurred while processing the pair command.", threadID, messageID);
    }
};
