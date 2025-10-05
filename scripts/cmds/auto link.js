const fs = require("fs");
const { downloadVideo } = require("sagor-video-downloader");

module.exports = {
    config: {
        name: "autolink",
        version: "1.0",
        author: "SaGor",
        countDown: 5,
        role: 0,
        shortDescription: "Auto-download and send videos with title",
        category: "media",
    },

    onStart: async function ({ api, event }) {
        // optional: code to run when bot starts
    },

    onChat: async function ({ api, event }) {
        const threadID = event.threadID;
        const message = event.body;

        // Match any URL in the message
        const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
        if (!linkMatch) return;

        const url = linkMatch[0];

        // React with a loading emoji
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            // Download video using the npm package
            const { title, filePath } = await downloadVideo(url);

            // Send video with title
            api.sendMessage(
                { body: `🎬 Title: ${title}`, attachment: fs.createReadStream(filePath) },
                threadID,
                () => {
                    // Remove temporary file after sending
                    fs.unlinkSync(filePath);
                }
            );
        } catch (err) {
            console.error("Error downloading video:", err.message);
            api.sendMessage(
                "❌ Error downloading video. Please check the link or try again later.",
                threadID,
                event.messageID
            );
        }
    }
};
