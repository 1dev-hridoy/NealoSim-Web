const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  name: "ai",
  author: "Hridoy",
  description: "Get a response from AI using GPT-4.",
  version: "1.0.0",
  category: "AI",
  aliases: [],
  cooldown: 5,
  adminOnly: false,
  usePrefix: "both",

  run: async ({ message, args, user }) => {

    if (!args.length) {
      return {
        text: `
╭━━━[ ⚠️ ERROR ]━━━╮
┃ Please provide a question!
┃ Example: !ai What is the weather like?
╰━━━━━━━━━━━━━━━━━━━╯`,
        buttons: [],
      };
    }

    const question = args.join(' ');
    const apiUrl = `https://nexalo-api.vercel.app/api/gpt4-v1?ask=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);
      const { reply } = response.data;

      return {
        text: `
╭━━━[ 🤖 AI RESPONSE ]━━━╮
┃ ${reply}
╰━━━━━━━━━━━━━━━━━━━━━━━╯`,
        buttons: [],
      };
    } catch (error) {
      console.error('API Error:', error.message);
      return {
        text: `
╭━━━[ ⚠️ ERROR ]━━━╮
┃ Failed to get AI response. Try again later.
╰━━━━━━━━━━━━━━━━━━━╯`,
        buttons: [],
      };
    }
  },
};