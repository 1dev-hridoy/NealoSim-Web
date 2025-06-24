const fs = require('fs');
const path = require('path');

module.exports = {
  name: "help",
  author: "Hridoy",
  description: "List all available commands or get details for a specific command.",
  version: "1.0.0",
  category: "Utility",
  aliases: ["commands"],
  cooldown: 10,
  adminOnly: false,
  usePrefix: "both",

  run: async ({ message, args, user }) => {
    const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands'))
      .filter(file => file.endsWith('.js'));

    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const commandFile = commandFiles.find(file => {
        const command = require(`../commands/${file}`);
        return command.name.toLowerCase() === commandName || command.aliases?.includes(commandName);
      });

      if (commandFile) {
        const command = require(`../commands/${commandFile}`);
        const aliases = command.aliases ? `Aliases: ${command.aliases.join(', ')}` : 'No aliases';
        const adminOnly = command.adminOnly ? 'Yes' : 'No';

        return {
          text: `
╭━━━[ 📋 COMMAND INFO: ${command.name.toUpperCase()} ]━━━╮
┃ Description : ${command.description}
┃ Author      : ${command.author}
┃ Version     : ${command.version}
┃ Category    : ${command.category}
┃ Cooldown    : ${command.cooldown} seconds
┃ Admin Only  : ${adminOnly}
┃ ${aliases}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*Use \`${command.name}\` to execute this command!*`,
          buttons: [],
        };
      } else {
        return {
          text: `
╭━━━[ ⚠️ ERROR ]━━━╮
┃ Command '${args[0]}' not found.
┃ Use '!help' to see available commands.
╰━━━━━━━━━━━━━━━━━━━╯`,
          buttons: [],
        };
      }
    }

    const commands = commandFiles.map(file => {
      const command = require(`../commands/${file}`);
      return `┃ 📌 \`${command.name}\` - ${command.description}`;
    });

    return {
      text: `
╭━━━[ 📚 AVAILABLE COMMANDS ]━━━╮
${commands.join('\n')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*Use '!help <command>' to get more details!*`,
      buttons: [],
    };
  },
};