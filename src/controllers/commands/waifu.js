const axios = require('axios');
const chalk = require('chalk');

module.exports = {
  name: 'waifu',
  description: 'Get a random SFW waifu image!',
  category: 'Fun',
  aliases: ['waifupic', 'kawaii'],
  usePrefix: true,
  adminOnly: false,
  cooldown: 20,
  async run({ message, args, user }) {
    try {
      console.log(chalk.blue(`[Waifu] Fetching image for ${user.name} (${user.uid})`));

      const response = await axios.get('https://api.waifu.pics/sfw/waifu');
      const imageUrl = response.data.url;

      const responseText = `
╭━━━[ 🌸 WAIFU TIME ]━━━╮
┃ 😍 A new waifu for you!
┃ ✨ Check the image below!
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

      console.log(chalk.green(`[Waifu] Sent image to ${user.name} (${user.uid})`));

      return {
        text: responseText,
        response: responseText,
        image: imageUrl
      };
    } catch (error) {
      console.error(chalk.red(`[Waifu] Error for ${user.name} (${user.uid}): ${error.message}`));
      const errorMessage = `Failed to fetch waifu image: ${error.message}`;
      return { error: errorMessage, response: errorMessage };
    }
  },
};