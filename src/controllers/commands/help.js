const fs = require('fs');
const path = require('path');

module.exports = {
  name: "help",
  author: "Hridoy",
  description: "List all available commands.",
  version: "1.0.0",
  category: "Utility",
  aliases: ["commands"],
  cooldown: 10,
  adminOnly: false,
  usePrefix: "both",

  run: async ({ message, args, user }) => {
    const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands'))
      .filter(file => file.endsWith('.js'));
    const commands = commandFiles.map(file => {
      const command = require(`../commands/${file}`);
      return `\`${command.name}\`: ${command.description}`;
    });

    return {
      text: `**Available Commands:**\n${commands.join('\n')}`,
      buttons: [],
    };
  },
};