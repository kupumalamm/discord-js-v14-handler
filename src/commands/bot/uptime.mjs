/** @type {import("../../data/BotTypes.mjs").CommandExport} */
export default {
  name: "uptime",
  description: "Shows the Bot's Uptime",
  category: "bot",
  cooldown: {
    user: 5000,
    guild: 0,
    global: 0,
  },
  async execute(client, interaction) {
    await interaction.reply({
      ephemeral: true,
      content: `🏓 I'm running since <t:${Math.floor((Date.now() + client.uptime) / 1000)}:R>`
    });
  }
}