const axios = require('axios');
const chalk = require('chalk');

module.exports = {
  name: 'coolfact',
  description: 'Get a random cool fact!',
  category: 'Fun',
  aliases: ['fact', 'wow'],
  usePrefix: true,
  adminOnly: false,
  cooldown: 15, 
  async run({ message, args, user }) {
    try {
      console.log(chalk.blue(`[CoolFact] Fetching fact for ${user.name} (${user.uid})`));

      const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const randomFact = res.data?.text || 'No fact found... bruh moment 😅';

      const responseText = `
╭━━━[ 🌟 COOL FACT ]━━━╮
┃ 💡 Fact   : ${randomFact}
┃ 😄 Enjoyed? Type again for more!
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

      console.log(chalk.green(`[CoolFact] Sent fact to ${user.name} (${user.uid})`));

      return {
        text: responseText,
        response: responseText
      };
    } catch (error) {
      console.error(chalk.red(`[CoolFact] Error for ${user.name} (${user.uid}): ${error.message}`));
      const errorMessage = `Oops! Couldn’t fetch a cool fact right now: ${error.message}`;
      return { error: errorMessage, response: errorMessage };
    }
  },
};
