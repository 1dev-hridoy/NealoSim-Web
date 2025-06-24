const chalk = require('chalk');

module.exports = {
  name: 'me',
  description: 'Display your user information from the database.',
  category: 'Utility',
  aliases: ['profile', 'info'],
  usePrefix: true,
  adminOnly: false,
  cooldown: 10, 
  async run({ message, args, user }) {
    try {
      console.log(chalk.blue(`[Me] Fetching info for ${user.name} (${user.uid})`));

      const userInfo = {
        name: user.name,
        email: user.email,
        uid: user.uid,
        joinedAt: user.joinedAt.toLocaleDateString(),
        emailVerified: user.emailVerified ? 'Yes' : 'No',
        isAdmin: user.isAdmin ? 'Yes' : 'No'
      };

      const responseText = `
╭━━━[ 👤 USER PROFILE ]━━━╮
┃ 🧑 Name   : ${userInfo.name}
┃ 📧 Email  : ${userInfo.email}
┃ 🆔 UID    : ${userInfo.uid}
┃ 📅 Joined : ${userInfo.joinedAt}
┃ ✅ Verified: ${userInfo.emailVerified}
┃ 🔒 Admin  : ${userInfo.isAdmin}
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

      console.log(chalk.green(`[Me] Info retrieved for ${user.name} (${user.uid})`));

      return {
        text: responseText,
        response: responseText
      };
    } catch (error) {
      console.error(chalk.red(`[Me] Error for ${user.name} (${user.uid}): ${error.message}`));
      const errorMessage = `An error occurred while fetching your profile: ${error.message}`;
      return { error: errorMessage, response: errorMessage };
    }
  },
};