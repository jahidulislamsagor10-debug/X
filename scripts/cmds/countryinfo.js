const axios = require('axios');

module.exports = {
  config: {
    name:"countryinfo",
    aliases: ["countryinfo"],
    version: "1.0",
    author: "SaGor"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(' ');

    if (!query) {
      return api.sendMessage("Give me a question!", event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(`https://restcountries.com/v3/name/${query}`);

      if (response.data) {
        const country = response.data[0];
        let message = '';

        message += `Name Of The Country: ${country.name.common}
Capital: ${country.capital}
Population: ${country.population}
Language:  ${Object.values(country.languages).join(', ')}
`;

        await api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage("I didn't find any country matching your search.!", event.threadID, event.messageID);
      }
    } catch (error) {
      api.sendMessage("I encountered an error while retrieving country information!", event.threadID, event.messageID);
    }
  }
};
