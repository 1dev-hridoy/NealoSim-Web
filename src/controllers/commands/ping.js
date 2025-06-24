module.exports = {
    name: "ping",
    author: "Hridoy",
    description: "Check if the bot is alive and responsive.",
    version: "1.0.0",
    category: "Utility",
    aliases: ["latency", "pong"],
    cooldown: 5,
    adminOnly: false,
    usePrefix: "both",
  
    run: async ({ message, args, user }) => {
      return {
        text: `🏓 Pong! Latency is smooth af.`,
        buttons: [],
      };
    },
  };