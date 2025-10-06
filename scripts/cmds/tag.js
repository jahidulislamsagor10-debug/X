module.exports.config = {
    name: "tag",
    version: "1.0",
    hasPermssion: 0,
    credits: "SaGor",
    description: "Mention the user of replied message",
    commandCategory: "Group",
    usages: "tag [optional text]",
    cooldowns: 3,
};

module.exports.onStart = async function({ api, event, args }) {
    if (!event.messageReply) return api.sendMessage("Reply to a message to tag!", event.threadID);

    const targetID = event.messageReply.senderID;
    const userInfo = await api.getUserInfo(targetID);
    if (!userInfo[targetID] || !userInfo[targetID].name) return;

    const name = userInfo[targetID].name;
    const extraText = args.join(" ") || "";

    await api.sendMessage({
        body: `@${name} ${extraText}`,
        mentions: [{ id: targetID, tag: name }]
    }, event.threadID);
};
