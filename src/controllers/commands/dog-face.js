const axios = require('axios');
const chalk = require('chalk');

module.exports = {
  name: 'dogfact',
  description: 'Fetch a random dog fact! 🐶',
  category: 'Fun',
  aliases: ['puppyfact', 'doggo'],
  usePrefix: true,
  adminOnly: false,
  cooldown: 10,

  async run({ message, args, user }) {
    try {
      console.log(chalk.blue(`[DogFact] Fetching dog fact for ${user.name} (${user.uid})`));

      const res = await axios.get('https://dog-api.kinduff.com/api/facts');
      const dogFact = res.data?.facts?.[0] || 'Dogs are awesome. That’s the fact. 🐾';

      const responseText = `
╭━━━[ 🐶 DOG FACT ]━━━╮
┃ 🐾 ${dogFact}
┃ 🐕 Type /dogfact again for more!
╰━━━━━━━━━━━━━━━━━━━━╯`;

      console.log(chalk.green(`[DogFact] Sent fact to ${user.name} (${user.uid})`));

      return {
        text: responseText,
        response: responseText
      };
    } catch (error) {
      console.error(chalk.red(`[DogFact] Error for ${user.name} (${user.uid}): ${error.message}`));
      const errorMessage = `Bruhh... can't fetch dog facts right now: ${error.message}`;
      return { error: errorMessage, response: errorMessage };
    }
  },
};
