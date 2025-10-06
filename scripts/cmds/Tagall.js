module.exports.config = {
    name: "tagall",
    version: "1.0",
    hasPermssion: 2,
    credits: "SaGor",
    description: "Tag all members fast with real names",
    commandCategory: "Group",
    usages: "[text]",
    cooldowns: 5,
};

module.exports.onStart = async function({ api, event, args }) {
    const { threadID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs;
    const textAfter = args.join(" ") || "";

    for (let i = 0; i < members.length; i++) {
        const uid = members[i];
        const info = await api.getUserInfo(uid);
        if (!info[uid] || !info[uid].name) continue;
        const name = info[uid].name;

        await api.sendMessage({
            body: `@${name} ${textAfter}`,
            mentions: [{ id: uid, tag: name }]
        }, threadID);

        await new Promise(resolve => setTimeout(resolve, 500));
    }
};
