/** @type {import("../../data/BotTypes.mjs").CommandExport} */
export default {
  name: "ping",
  description: "Shows the Bot's Ping",
  category: "bot",
  cooldown: {
    user: 5000,
    guild: 0,
    global: 0,
  },
  async execute(client, interaction) {
    await interaction.reply({
      ephemeral: true,
      content: `🏓 Pong \`${client.ws.ping}ms\``
    });
  }
}
