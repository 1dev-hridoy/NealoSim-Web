const axios = require('axios');
const chalk = require('chalk');

module.exports = {
  name: 'joke',
  description: 'Get a random dumb joke 😂',
  category: 'Fun',
  aliases: ['lol', 'funny'],
  usePrefix: true,
  adminOnly: false,
  cooldown: 10,

  async run({ message, args, user }) {
    try {
      console.log(chalk.blue(`[Joke] Fetching joke for ${user.name} (${user.uid})`));

      const res = await axios.get('https://api.popcat.xyz/joke');
      const joke = res.data?.joke || "No joke today bro, system went full serious mode 😩";

      const responseText = `
╭━━━[ 🤣 RANDOM JOKE ]━━━╮
┃ ${joke}
┃ 
┃ 😂 Wanna hear more? Use /joke again!
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

      console.log(chalk.green(`[Joke] Sent joke to ${user.name} (${user.uid})`));

      return {
        text: responseText,
        response: responseText
      };
    } catch (error) {
      console.error(chalk.red(`[Joke] Error for ${user.name} (${user.uid}): ${error.message}`));
      const errorMessage = `Bruh... Joke machine broke: ${error.message}`;
      return { error: errorMessage, response: errorMessage };
    }
  },
};
