const axios = require('axios');
const chalk = require('chalk');

module.exports = {
  name: 'art',
  description: 'Generate an art image based on a prompt',
  category: 'Utility',
  aliases: ['generate-art'],
  usePrefix: true,
  adminOnly: false,
  cooldown: 10, 
  async run({ message, args, user }) {
    if (!args.length) {
      console.log(chalk.yellow(`⚠️ ${user.name} used art command without a prompt`));
      return { text: 'Please provide a prompt for the art (e.g., `!art a car`).' };
    }

    const prompt = args.join(' ');
    console.log(chalk.blue(`🎨 ${user.name} requested art with prompt: ${prompt}`));

    try {
      const response = await axios.get(`https://nexalo-api.vercel.app/api/art?prompt=${encodeURIComponent(prompt)}`);
      const result = response.data;

      if (result.response) {
        console.log(chalk.green(`✅ Art generated for ${user.name}: ${result.response}`));
        return {
          text: `Generated art for "${prompt}":`,
          image: result.response,
        };
      } else {
        console.log(chalk.red(`❌ Art API error for ${user.name}: No image URL returned`));
        return { text: 'Sorry, I couldn’t generate the art. Try a different prompt.' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.log(chalk.red(`❌ Art API error for ${user.name}: ${errorMessage}`));
      return { text: `Oops! Something went wrong: ${errorMessage}` };
    }
  },
};