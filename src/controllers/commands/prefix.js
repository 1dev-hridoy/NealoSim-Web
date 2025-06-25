const fs = require('fs');
const path = require('path');

module.exports = {
  name: "prefix",
  author: "Hridoy",
  description: "Show the bot name and prefix from config.",
  version: "1.0.0",
  category: "Utility",
  aliases: [],
  cooldown: 5,
  adminOnly: false,
  usePrefix: "both",

  run: async ({ message, args, user }) => {
    try {
      const configPath = path.join(__dirname, '..', '..', 'config', 'bot.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('bot.json not found.');
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const botName = config.botName || 'Bot';
      const prefix = config.prefix || '!';

      return {
        text: `
╭━━━[ ℹ️ BOT INFO ]━━━╮
┃ 🤖 Bot Name : ${botName}
┃ 💬 Prefix   : ${prefix}
╰━━━━━━━━━━━━━━━━━━━━╯`,
        buttons: [],
      };
    } catch (error) {
      console.error('Error reading bot config:', error.message);
      return {
        text: `
╭━━━[ ⚠️ ERROR ]━━━╮
┃ Failed to load bot info. Try again later.
╰━━━━━━━━━━━━━━━━━━━━╯`,
        buttons: [],
      };
    }
  },
};
