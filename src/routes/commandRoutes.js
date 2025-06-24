const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const ChatLog = require('../models/ChatLog');
const chalk = require('chalk');

const router = express.Router();
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../controllers/commands'))
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../controllers/commands/${file}`);
  commands.set(command.name, command);
}

router.get('/commands', (req, res) => {
  const commandList = Array.from(commands.values()).map(cmd => ({
    name: cmd.name,
    description: cmd.description,
    category: cmd.category,
    aliases: cmd.aliases,
    adminOnly: cmd.adminOnly,
  }));
  res.json(commandList);
});

router.post('/chat', authMiddleware, async (req, res) => {
  const { message, uid } = req.body;
  const user = req.user;
  let config;
  try {
    config = require('../config/bot.json');
    console.log(chalk.green(`✅ Bot Config Loaded: ${config.botName}`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to Load Bot Config: ${error.message}`));
    return res.status(500).json({ error: 'Server configuration error' });
  }
  const prefix = config.prefix;
  const language = config.language || 'bn'; 

  if (!message) {
    console.log(chalk.red(`❌ Chat Error for ${user.name} (${uid}): Empty message`));
    return res.status(400).json({ error: 'Message is required' });
  }

  console.log(chalk.cyan(`💬 ${user.name} (${uid}) sent: ${message}`));

  let commandName, args;
  const isPrefixed = message.startsWith(prefix);
  if (isPrefixed) {
    const parts = message.slice(prefix.length).trim().split(/ +/);
    commandName = parts.shift().toLowerCase();
    args = parts;
  } else {
    const parts = message.trim().split(/ +/);
    commandName = parts.shift().toLowerCase();
    args = parts;
  }

  let command = commands.get(commandName);
  if (!command) {

    for (const [_, cmd] of commands) {
      if (cmd.aliases && cmd.aliases.includes(commandName)) {
        command = cmd;
        break;
      }
    }
  }

  if (command) {

    if (command.usePrefix === true && !isPrefixed) {
      console.log(chalk.yellow(`⚠️ ${user.name} used ${commandName} without prefix`));
      return res.json({ text: `This command requires the prefix \`${prefix}\`.` });
    }
    if (command.usePrefix === false && isPrefixed) {
      console.log(chalk.yellow(`⚠️ ${user.name} used ${commandName} with prefix`));
      return res.json({ text: `This command does not use a prefix.` });
    }

    if (command.adminOnly && user.uid !== config.adminUID) {
      console.log(chalk.red(`❌ ${user.name} attempted admin-only command ${commandName}`));
      return res.json({ text: 'This command is for admins only.' });
    }

    const now = new Date();
    const cooldownKey = `${user.uid}:${command.name}`;
    const lastUsed = user.cooldowns.get(cooldownKey);
    if (lastUsed && (now - lastUsed) / 1000 < command.cooldown) {
      const remaining = (command.cooldown - (now - lastUsed) / 1000).toFixed(1);
      console.log(chalk.yellow(`⏳ ${user.name} on cooldown for ${commandName} (${remaining}s remaining)`));
      return res.json({ text: `Command on cooldown. Try again in ${remaining}s.` });
    }

    user.cooldowns.set(cooldownKey, now);
    await user.save();

    try {
      const result = await command.run({ message, args, user });
      console.log(chalk.green(`✅ ${user.name} executed ${commandName}: ${result.text}`));
      const log = new ChatLog({
        userId: user.uid,
        username: user.name,
        message,
        response: result.text,
      });
      await log.save();

      res.json(result);
    } catch (error) {
      console.log(chalk.red(`❌ Error executing ${commandName} by ${user.name}: ${error.message}`));
      res.status(500).json({ error: 'Error executing command.' });
    }
  } else {
  
    console.log(chalk.blue(`🌐 Sending to Nexalo Sim API: ${message} (Language: ${language})`));
    try {
      const response = await axios.post('https://sim.api.nexalo.xyz/v2/chat', {
        api: process.env.NEXA_API_KEY,
        question: message,
        language: language,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const result = response.data;

      if (result.status_code === 200 && result.status === 'OK' && result.data) {
        const { answer } = result.data;
        console.log(chalk.green(`✅ Nexalo Sim API Response: ${answer}`));
        const log = new ChatLog({
          userId: user.uid,
          username: user.name,
          message,
          response: answer,
        });
        await log.save();
        res.json({ text: answer });
      } else {
        console.log(chalk.red(`❌ Nexalo Sim API Error: ${result.message || 'Unknown error'}`));
        res.json({ text: `Sorry, I couldn’t get a response: ${result.message || 'Unknown error'}` });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.log(chalk.red(`❌ Nexalo Sim API Error: ${errorMessage}`));
      res.json({ text: `Oops! Something went wrong: ${errorMessage}` });
    }
  }
});

module.exports = router;