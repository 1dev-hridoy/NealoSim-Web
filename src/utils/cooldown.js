const User = require('../models/User');

async function checkCooldown(user, commandName, cooldownSeconds) {
  const cooldownKey = `${user.uid}:${commandName}`;
  const now = Date.now();
  const lastUsed = user.cooldowns.get(cooldownKey);

  if (lastUsed && (now - lastUsed) / 1000 < cooldownSeconds) {
    return cooldownSeconds - (now - lastUsed) / 1000; 
  }

  user.cooldowns.set(cooldownKey, now);
  await user.save();
  return false; 
}

module.exports = { checkCooldown };