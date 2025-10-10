module.exports = {
  config: {
    name: "www",
    aliases: ["whowouldwin"],
    version: "1.0.0",
    role: 0,
    author: "SaGor",
    description: { en: "Generate a Who Would Win image between you and another group member" },
    longDescription: { en: "Randomly selects two members and generates a Who Would Win image using their profile pictures" },
    commandCategory: "Fun",
    usages: "{pn}",
    cooldowns: 5
  },

  onStart: async function({ api, event }) {
    const { threadID, senderID } = event;

    let dataSender = await api.getUserInfo(senderID);
    let nameSender = dataSender[senderID].name;

    let threadInfo = await api.getThreadInfo(threadID);
    let participants = threadInfo.participantIDs;

    let id1 = senderID;
    let id2;
    do {
      id2 = participants[Math.floor(Math.random() * participants.length)];
    } while (id2 === id1);

    let data1 = await api.getUserInfo(id1);
    let name1 = data1[id1].name;

    let data2 = await api.getUserInfo(id2);
    let name2 = data2[id2].name;

    let arraytag = [
      { id: id1, tag: name1 },
      { id: id2, tag: name2 }
    ];

    let messageBody = `Who would win? ${name1} vs ${name2}!`;

    let imageUrl = `https://api.popcat.xyz/whowouldwin?image1=https://api-canvass.vercel.app/profile?uid=${id1}&image2=https://api-canvass.vercel.app/profile?uid=${id2}`;

    api.sendMessage({
      body: messageBody,
      mentions: arraytag,
      attachment: await global.utils.getStreamFromURL(imageUrl)
    }, threadID);
  }
};
